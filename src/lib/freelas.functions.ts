import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SITE_URL } from "./site";

const publicClient = () =>
  createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

async function pingGoogleIndexing(url: string, type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED") {
  try {
    if (!process.env.GOOGLE_INDEXING_SA_JSON) return;
    const { getAccessToken, publish } = await import("./google-indexing.functions");
    const token = await getAccessToken();
    await publish(url, type, token);
  } catch (err) {
    console.warn("[freelas pingGoogleIndexing]", err);
  }
}


export const CATEGORIAS_FREELA = [
  { slug: "design-grafico", label: "Design Gráfico" },
  { slug: "design-ui-ux", label: "Design UI/UX" },
  { slug: "desenvolvimento-web", label: "Desenvolvimento Web" },
  { slug: "desenvolvimento-mobile", label: "Desenvolvimento Mobile" },
  { slug: "social-media", label: "Social Media" },
  { slug: "marketing-digital", label: "Marketing Digital" },
  { slug: "redacao-copywriting", label: "Redação / Copywriting" },
  { slug: "fotografia", label: "Fotografia" },
  { slug: "video-edicao", label: "Vídeo / Edição" },
  { slug: "audio-locucao", label: "Áudio / Locução" },
  { slug: "traducao", label: "Tradução" },
  { slug: "consultoria", label: "Consultoria" },
  { slug: "arquitetura-interiores", label: "Arquitetura / Interiores" },
  { slug: "ilustracao", label: "Ilustração" },
  { slug: "outros", label: "Outros" },
] as const;

// ---------- LEITURAS PÚBLICAS ----------

export const listFreelancers = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        categoria: z.string().optional(),
        cidade: z.string().optional(),
        q: z.string().optional(),
        limit: z.number().int().min(1).max(60).default(24),
        offset: z.number().int().min(0).default(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supa = publicClient();
    let q = supa
      .from("freelancers")
      .select(
        "id, handle, nome, headline, avatar_url, cover_url, categoria_principal, cidade, estado, atende_remoto, nivel, valor_hora_min, verificado, destaque, skills",
      )
      .eq("ativo", true)
      .order("destaque", { ascending: false })
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (data.categoria) q = q.eq("categoria_principal", data.categoria);
    if (data.cidade) q = q.ilike("cidade", data.cidade);
    if (data.q) q = q.or(`nome.ilike.%${data.q}%,headline.ilike.%${data.q}%`);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getFreelancerPublico = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ handle: z.string().trim().min(1).max(50) }).parse(input))
  .handler(async ({ data }) => {
    const supa = publicClient();
    const { data: f } = await supa
      .from("freelancers")
      .select("*")
      .eq("handle", data.handle)
      .eq("ativo", true)
      .maybeSingle();
    if (!f) return null;

    const [{ data: projetos }, { data: avaliacoes }] = await Promise.all([
      supa
        .from("freelancer_projetos")
        .select("*")
        .eq("freelancer_id", f.id)
        .eq("publicado", true)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false }),
      supa
        .from("freelancer_avaliacoes")
        .select("id, autor_nome, autor_empresa, nota, comentario, created_at")
        .eq("freelancer_id", f.id)
        .eq("aprovada", true)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const notaMedia = avaliacoes?.length
      ? avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length
      : null;

    return {
      freela: f,
      projetos: projetos ?? [],
      avaliacoes: avaliacoes ?? [],
      notaMedia,
    };
  });

// ---------- ESCRITAS DO PRÓPRIO FREELA ----------

const HandleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9-]{2,30}$/, "Use apenas letras, números e hífens (3-31 caracteres).");

const FreelaUpsertSchema = z.object({
  handle: HandleSchema,
  nome: z.string().trim().min(2).max(80),
  headline: z.string().trim().max(120).optional().nullable(),
  bio: z.string().trim().max(2000).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  cover_url: z.string().url().optional().nullable(),
  categoria_principal: z.string().trim().min(1).max(60),
  skills: z.array(z.string().trim().max(30)).max(15).default([]),
  cidade: z.string().trim().max(80).optional().nullable(),
  estado: z.string().trim().length(2).optional().nullable(),
  atende_remoto: z.boolean().default(true),
  nivel: z.enum(["junior", "pleno", "senior", "especialista"]).optional().nullable(),
  disponibilidade: z.enum(["imediata", "ate_15d", "ate_30d", "indisponivel"]).default("imediata"),
  valor_hora_min: z.number().min(0).max(9999).optional().nullable(),
  whatsapp: z.string().trim().max(20).optional().nullable(),
  instagram: z.string().trim().max(80).optional().nullable(),
  linkedin: z.string().trim().max(200).optional().nullable(),
  behance: z.string().trim().max(200).optional().nullable(),
  site: z.string().trim().max(200).optional().nullable(),
  notif_email: z.boolean().default(true),
  notif_email_endereco: z.string().trim().email().optional().nullable(),
  notif_wa: z.boolean().default(false),
});

export const upsertMeuFreelancer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => FreelaUpsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Handle único
    const { data: existing } = await supabase
      .from("freelancers")
      .select("id, user_id")
      .eq("handle", data.handle)
      .maybeSingle();
    if (existing && existing.user_id !== userId) {
      throw new Error("Este @ já está em uso. Escolha outro.");
    }

    const { data: mine } = await supabase
      .from("freelancers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (mine) {
      const { error } = await supabase
        .from("freelancers")
        .update({ ...data })
        .eq("id", mine.id);
      if (error) throw new Error(error.message);
      void pingGoogleIndexing(`${SITE_URL}/freelas/p/${data.handle}`);
      return { id: mine.id, handle: data.handle };
    }

    const { data: created, error } = await supabase
      .from("freelancers")
      .insert({ ...data, user_id: userId })
      .select("id, handle")
      .single();
    if (error) throw new Error(error.message);
    void pingGoogleIndexing(`${SITE_URL}/freelas/p/${created!.handle}`);
    return { id: created!.id, handle: created!.handle };
  });

export const getMeuFreelancer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("freelancers").select("*").eq("user_id", userId).maybeSingle();
    return data;
  });

// ---------- PROJETOS ----------

const ProjetoSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{1,60}$/, "Slug inválido."),
  descricao: z.string().trim().max(3000).optional().nullable(),
  cliente_nome: z.string().trim().max(80).optional().nullable(),
  ano: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional().nullable(),
  link_externo: z.string().url().optional().nullable(),
  tags: z.array(z.string().trim().max(20)).max(10).default([]),
  imagens: z.array(z.string().url()).max(10).default([]),
  capa_url: z.string().url().optional().nullable(),
  publicado: z.boolean().default(true),
});

export const saveMeuProjeto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ProjetoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: freela } = await supabase
      .from("freelancers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!freela) throw new Error("Crie seu perfil freelancer primeiro.");

    if (data.id) {
      const { error } = await supabase
        .from("freelancer_projetos")
        .update({ ...data })
        .eq("id", data.id)
        .eq("freelancer_id", freela.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const { data: created, error } = await supabase
      .from("freelancer_projetos")
      .insert({ ...data, freelancer_id: freela.id })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created!.id };
  });

export const deleteMeuProjeto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: freela } = await supabase
      .from("freelancers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!freela) throw new Error("Perfil não encontrado.");
    const { error } = await supabase
      .from("freelancer_projetos")
      .delete()
      .eq("id", data.id)
      .eq("freelancer_id", freela.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMeusProjetos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: freela } = await supabase
      .from("freelancers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!freela) return [];
    const { data } = await supabase
      .from("freelancer_projetos")
      .select("*")
      .eq("freelancer_id", freela.id)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });
    return data ?? [];
  });

// ---------- ORÇAMENTOS ----------

const OrcamentoSchema = z.object({
  freelancer_id: z.string().uuid(),
  nome: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().min(8).max(20),
  email: z.string().email().optional().nullable(),
  descricao: z.string().trim().min(10).max(2000),
  orcamento_alvo: z.number().min(0).max(999999).optional().nullable(),
  prazo_dias: z.number().int().min(1).max(365).optional().nullable(),
});

export const enviarOrcamento = createServerFn({ method: "POST" })
  .inputValidator((input) => OrcamentoSchema.parse(input))
  .handler(async ({ data }) => {
    const supa = publicClient();
    const { error } = await supa.from("freelancer_orcamentos").insert({ ...data });
    if (error) throw new Error(error.message);

    // Notificação por email (fire-and-forget, não bloqueia o cliente)
    void (async () => {
      try {
        if (!process.env.RESEND_API_KEY) return;
        const { data: freela } = await supa
          .from("freelancers")
          .select("nome, handle, whatsapp, notif_email, notif_email_endereco, user_id")
          .eq("id", data.freelancer_id)
          .maybeSingle();
        if (!freela || !freela.notif_email) return;

        // Endereço: override explícito OU email do auth do usuário
        let destino = freela.notif_email_endereco ?? null;
        if (!destino) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: userInfo } = await supabaseAdmin.auth.admin.getUserById(freela.user_id);
          destino = userInfo?.user?.email ?? null;
        }
        if (!destino) return;

        const linkOrcamentos = `${SITE_URL}/freelancer/orcamentos`;
        const whatsappCliente = data.whatsapp.replace(/\D/g, "");
        const html = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:auto;padding:24px;background:#fafafa;border-radius:16px;">
            <div style="background:linear-gradient(135deg,#1e1e5a,#4f46e5);color:#fff;padding:20px;border-radius:12px;margin-bottom:20px;">
              <p style="margin:0;font-size:12px;opacity:0.8;text-transform:uppercase;letter-spacing:1px;">Novo pedido de orçamento</p>
              <h1 style="margin:6px 0 0;font-size:24px;">${escapeHtml(data.nome)} quer conversar</h1>
            </div>
            <p style="font-size:15px;line-height:1.55;color:#111;">${escapeHtml(data.descricao)}</p>
            <table style="width:100%;margin-top:16px;font-size:13px;color:#555;">
              <tr><td style="padding:4px 0;"><strong>WhatsApp</strong></td><td>${escapeHtml(data.whatsapp)}</td></tr>
              ${data.email ? `<tr><td style="padding:4px 0;"><strong>Email</strong></td><td>${escapeHtml(data.email)}</td></tr>` : ""}
              ${data.orcamento_alvo ? `<tr><td style="padding:4px 0;"><strong>Orçamento alvo</strong></td><td>R$ ${data.orcamento_alvo}</td></tr>` : ""}
              ${data.prazo_dias ? `<tr><td style="padding:4px 0;"><strong>Prazo</strong></td><td>${data.prazo_dias} dias</td></tr>` : ""}
            </table>
            <div style="margin-top:24px;display:flex;gap:8px;flex-wrap:wrap;">
              <a href="https://wa.me/55${whatsappCliente}" style="display:inline-block;background:#25D366;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">Responder no WhatsApp</a>
              <a href="${linkOrcamentos}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">Ver no painel</a>
            </div>
            <p style="margin-top:24px;font-size:11px;color:#999;">Você recebeu este email porque ativou notificações no VagasAgora. Prefere desativar? Acesse seu perfil.</p>
          </div>`;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "VagasAgora <noreply@vagasagora.com.br>",
            to: [destino],
            subject: `💼 Novo orçamento de ${data.nome}`,
            html,
            reply_to: data.email || undefined,
          }),
        });
      } catch (err) {
        console.warn("[enviarOrcamento email]", err);
      }
    })();

    return { ok: true };
  });

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string),
  );
}


export const listMeusOrcamentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: freela } = await supabase
      .from("freelancers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!freela) return [];
    const { data } = await supabase
      .from("freelancer_orcamentos")
      .select("*")
      .eq("freelancer_id", freela.id)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const atualizarStatusOrcamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["novo", "respondido", "fechado", "perdido"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("freelancer_orcamentos")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- AVALIAÇÕES ----------

export const enviarAvaliacao = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        freelancer_id: z.string().uuid(),
        autor_nome: z.string().trim().min(2).max(80),
        autor_empresa: z.string().trim().max(80).optional().nullable(),
        nota: z.number().int().min(1).max(5),
        comentario: z.string().trim().min(10).max(1000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supa = publicClient();
    const { error } = await supa.from("freelancer_avaliacoes").insert({ ...data, aprovada: false });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMinhasAvaliacoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: freela } = await supabase
      .from("freelancers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!freela) return [];
    const { data } = await supabase
      .from("freelancer_avaliacoes")
      .select("*")
      .eq("freelancer_id", freela.id)
      .order("created_at", { ascending: false });
    return data ?? [];
  });
