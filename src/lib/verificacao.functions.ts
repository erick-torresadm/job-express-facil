import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const REQUIRED_FIELDS = [
  "company_name",
  "full_name",
  "whatsapp",
  "cpf_cnpj",
  "logo_url",
  "sobre",
  "cor_primaria",
  "slug_publico",
] as const;

export const getStatusVerificacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, full_name, whatsapp, cpf_cnpj, logo_url, sobre, cor_primaria, slug_publico, verificada")
      .eq("id", userId)
      .maybeSingle();

    const preenchidos = REQUIRED_FIELDS.filter((f) => {
      const v = (profile as any)?.[f];
      return typeof v === "string" ? v.trim().length > 0 : Boolean(v);
    });
    const completude = Math.round((preenchidos.length / REQUIRED_FIELDS.length) * 100);
    const faltando = REQUIRED_FIELDS.filter((f) => !preenchidos.includes(f));

    const { data: ultima } = await supabase
      .from("verificacoes")
      .select("id, status, motivo_rejeicao, created_at, reviewed_at")
      .eq("empresa_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      verificada: !!profile?.verificada,
      completude,
      faltando,
      ultima_solicitacao: ultima ?? null,
    };
  });

export const enviarVerificacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      documento_url: z.string().trim().min(1).max(500),
      comprovante_url: z.string().trim().min(1).max(500),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, full_name, whatsapp, cpf_cnpj, logo_url, sobre, cor_primaria, slug_publico")
      .eq("id", userId)
      .maybeSingle();

    const missing = REQUIRED_FIELDS.filter((f) => {
      const v = (profile as any)?.[f];
      return !(typeof v === "string" ? v.trim().length > 0 : Boolean(v));
    });
    if (missing.length > 0) {
      throw new Error("Complete 100% do perfil antes de solicitar verificação.");
    }

    const { data: pendente } = await supabase
      .from("verificacoes")
      .select("id")
      .eq("empresa_id", userId)
      .eq("status", "pendente")
      .maybeSingle();
    if (pendente) throw new Error("Você já tem uma solicitação em análise.");

    const { error } = await supabase.from("verificacoes").insert({
      empresa_id: userId,
      documento_url: data.documento_url,
      comprovante_url: data.comprovante_url,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Admin ----------

async function ensureAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const isAdmin = (data ?? []).some((r: any) => r.role === "admin");
  if (!isAdmin) throw new Error("Acesso restrito ao administrador.");
}

export const listarVerificacoesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);

    const { data: verifs } = await supabaseAdmin
      .from("verificacoes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    const ids = Array.from(new Set((verifs ?? []).map((v) => v.empresa_id)));
    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select("id, company_name, full_name, whatsapp, cpf_cnpj, logo_url, slug_publico, verificada")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const map = new Map((profs ?? []).map((p) => [p.id, p]));

    const items = await Promise.all((verifs ?? []).map(async (v) => {
      const [doc, comp] = await Promise.all([
        supabaseAdmin.storage.from("verificacao-docs").createSignedUrl(v.documento_url, 60 * 30),
        supabaseAdmin.storage.from("verificacao-docs").createSignedUrl(v.comprovante_url, 60 * 30),
      ]);
      return {
        ...v,
        empresa: map.get(v.empresa_id) ?? null,
        documento_signed_url: doc.data?.signedUrl ?? null,
        comprovante_signed_url: comp.data?.signedUrl ?? null,
      };
    }));
    return items;
  });

export const revisarVerificacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      acao: z.enum(["aprovar", "rejeitar"]),
      motivo: z.string().trim().max(500).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);

    const status = data.acao === "aprovar" ? "aprovado" : "rejeitado";
    const { data: row, error } = await supabaseAdmin
      .from("verificacoes")
      .update({
        status,
        motivo_rejeicao: data.acao === "rejeitar" ? (data.motivo ?? null) : null,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("empresa_id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Solicitação não encontrada.");

    if (data.acao === "aprovar") {
      await supabaseAdmin.from("profiles").update({ verificada: true }).eq("id", row.empresa_id);
      await supabaseAdmin.from("notificacoes").insert({
        user_id: row.empresa_id,
        titulo: "✅ Sua empresa foi verificada!",
        mensagem: "Agora você exibe o selo de verificada nas suas vagas e página.",
        link: "/empresa/pagina",
      });
    } else {
      await supabaseAdmin.from("notificacoes").insert({
        user_id: row.empresa_id,
        titulo: "Verificação recusada",
        mensagem: data.motivo || "Revise os documentos enviados e tente novamente.",
        link: "/empresa/verificacao",
      });
    }
    return { ok: true };
  });
