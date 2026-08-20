import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { notifyUsersPush } from "@/lib/push-notify.server";

export const FREE_REVELACOES = 10;

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

// ---------- Página pública da empresa ----------

export const getEmpresaPagina = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data } = await supabaseAdmin
      .from("profiles")
      .select(
        "company_name, full_name, logo_url, cor_primaria, sobre, slug_publico, campos_extras, raio_km_padrao, latitude, longitude",
      )
      .eq("id", userId)
      .maybeSingle();
    return data ?? null;
  });

export const salvarEmpresaPagina = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      slug_publico: z.string().trim().min(3).max(50).regex(/^[a-z0-9-]+$/, "use letras, números e hifens"),
      company_name: z.string().trim().min(1).max(120),
      sobre: z.string().trim().max(2000).optional().nullable(),
      logo_url: z.string().trim().url().max(500).optional().nullable(),
      cor_primaria: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
      campos_extras: z.array(z.object({
        label: z.string().trim().min(1).max(80),
        tipo: z.enum(["texto", "numero", "sim_nao"]),
        obrigatorio: z.boolean().default(false),
      })).max(8).default([]),
      raio_km_padrao: z.number().int().min(1).max(500).optional().nullable(),
      latitude: z.number().min(-90).max(90).optional().nullable(),
      longitude: z.number().min(-180).max(180).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    // garante slug único
    const { data: existing } = await supabaseAdmin
      .from("profiles").select("id").eq("slug_publico", data.slug_publico).maybeSingle();
    if (existing && existing.id !== userId) {
      throw new Error("Esse link já está em uso, escolha outro.");
    }
    const { error, data: updated } = await supabaseAdmin
      .from("profiles")
      .update({
        slug_publico: data.slug_publico,
        company_name: data.company_name,
        sobre: data.sobre ?? null,
        logo_url: data.logo_url ?? null,
        cor_primaria: data.cor_primaria ?? null,
        campos_extras: data.campos_extras,
        raio_km_padrao: data.raio_km_padrao ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      })
      .eq("id", userId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!updated) throw new Error("Perfil não encontrado para atualizar.");
    return { ok: true, slug: data.slug_publico };
  });

// Leitura pública da página da empresa (usa admin client p/ projetar só colunas seguras)
export const getPaginaPublica = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().trim().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { data: empresa } = await supabaseAdmin
      .from("profiles")
      .select("id, company_name, logo_url, cor_primaria, sobre, slug_publico, campos_extras, verificada")
      .eq("slug_publico", data.slug)
      .maybeSingle();
    if (!empresa) return null;
    const { data: vagas } = await supabaseAdmin
      .from("vagas")
      .select("id, slug, titulo, bairro, cidade, salario, horario, profissao_slug")
      .eq("empresa_id", empresa.id)
      .eq("ativa", true)
      .order("created_at", { ascending: false })
      .limit(20);
    return { empresa, vagas: vagas ?? [] };
  });

export const sugerirSlugEmpresa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ nome: z.string().trim().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    let base = slugify(data.nome) || "empresa";
    for (let i = 0; i < 10; i++) {
      const tentativa = i === 0 ? base : `${base}-${i + 1}`;
      const { data: ex } = await supabaseAdmin.from("profiles").select("id").eq("slug_publico", tentativa).maybeSingle();
      if (!ex) return { slug: tentativa };
    }
    return { slug: `${base}-${Date.now().toString(36).slice(-4)}` };
  });

// ---------- Captação de currículo via página personalizada ----------

export const enviarCurriculoEmpresa = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      slug: z.string().trim().min(1).max(80),
      nome: z.string().trim().min(2).max(120),
      whatsapp: z.string().trim().min(8).max(20),
      profissao: z.string().trim().min(2).max(80),
      bairro: z.string().trim().max(80).optional().nullable(),
      cidade: z.string().trim().max(80).optional().nullable(),
      resumo: z.string().trim().min(10).max(2000),
      respostas_extras: z.record(z.string().max(80), z.string().max(500)).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: empresa } = await supabaseAdmin
      .from("profiles").select("id").eq("slug_publico", data.slug).maybeSingle();
    if (!empresa) throw new Error("Empresa não encontrada");

    const slug = `${slugify(data.nome)}-${Date.now().toString(36).slice(-5)}`;
    const dicas: string[] = [];
    if (data.respostas_extras && Object.keys(data.respostas_extras).length) {
      for (const [k, v] of Object.entries(data.respostas_extras)) dicas.push(`${k}: ${v}`);
    }

    const { error } = await supabaseAdmin.from("curriculos").insert({
      slug,
      nome: data.nome,
      whatsapp: data.whatsapp,
      profissao: data.profissao,
      bairro: data.bairro,
      cidade: data.cidade,
      resumo: data.resumo,
      empresa_origem_id: empresa.id,
      dicas,
    });
    if (error) throw error;

    // notifica a empresa — in-app + push (sem isso ela só ficava sabendo se
    // abrisse o painel, nunca recebia aviso no celular/PWA como as outras
    // notificações do site)
    const titulo = `Novo candidato pela sua página: ${data.nome}`;
    const mensagem = `${data.profissao}${data.bairro ? " • " + data.bairro : ""}`;
    await supabaseAdmin.from("notificacoes").insert({
      user_id: empresa.id,
      titulo,
      mensagem,
      link: "/empresa",
    });
    notifyUsersPush([empresa.id], { title: titulo, body: mensagem, url: "/empresa" }).catch(() => null);

    return { ok: true };
  });

// ---------- Revelação de contato (10 grátis, ilimitado com assinatura ativa) ----------

async function temAssinaturaAtiva(empresaId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("assinaturas")
    .select("id")
    .eq("empresa_id", empresaId)
    .eq("status", "ativa")
    .limit(1)
    .maybeSingle();
  return !!data;
}

export const getRevelacoesInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ count }, ilimitado] = await Promise.all([
      supabase.from("revelacoes").select("id", { count: "exact", head: true }).eq("empresa_id", userId),
      temAssinaturaAtiva(userId),
    ]);
    const usadas = count ?? 0;
    if (ilimitado) return { usadas, limite: null, restantes: null, ilimitado: true as const };
    return { usadas, limite: FREE_REVELACOES, restantes: Math.max(0, FREE_REVELACOES - usadas), ilimitado: false as const };
  });

export const revelarContato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ curriculo_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // já revelado antes? devolve sem consumir cota
    const { data: existente } = await supabase
      .from("revelacoes").select("id").eq("empresa_id", userId).eq("curriculo_id", data.curriculo_id).maybeSingle();

    if (!existente) {
      const ilimitado = await temAssinaturaAtiva(userId);
      if (!ilimitado) {
        const { count } = await supabase
          .from("revelacoes").select("id", { count: "exact", head: true }).eq("empresa_id", userId);
        if ((count ?? 0) >= FREE_REVELACOES) {
          throw new Error(`Você já usou seus ${FREE_REVELACOES} contatos grátis. Assine um plano para continuar.`);
        }
      }
      const { error } = await supabase.from("revelacoes").insert({
        empresa_id: userId, curriculo_id: data.curriculo_id,
      });
      if (error) throw error;
    }

    const { data: contato } = await supabaseAdmin
      .from("curriculos")
      .select("nome, whatsapp, email")
      .eq("id", data.curriculo_id)
      .maybeSingle();
    if (!contato) throw new Error("Currículo não encontrado");
    return contato;
  });

// ---------- Listagem de candidatos pro painel da empresa ----------

export const listarCandidatosBusca = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      busca: z.string().trim().max(120).optional().nullable(),
      profissao: z.string().trim().max(80).optional().nullable(),
      cidade: z.string().trim().max(80).optional().nullable(),
      bairro: z.string().trim().max(80).optional().nullable(),
      limite: z.number().int().min(1).max(60).default(30),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Only accounts with the 'empresa' role may browse the candidate directory.
    // Without this check any signed-in candidato could enumerate every resume
    // via the admin client (which bypasses RLS). We read user_roles directly
    // (RLS allows a user to see their own roles).
    const { data: myRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isEmpresa = (myRoles ?? []).some((r) => r.role === "empresa");
    if (!isEmpresa) {
      throw new Error("Acesso restrito a contas de empresa.");
    }

    let q = supabaseAdmin
      .from("curriculos")
      .select("id,slug,nome,profissao,bairro,cidade,resumo,habilidades,experiencias,tem_video,tem_audio,created_at")
      .order("created_at", { ascending: false })
      .limit(data.limite);

    if (data.profissao) q = q.ilike("profissao", `%${data.profissao}%`);
    if (data.cidade) q = q.ilike("cidade", `%${data.cidade}%`);
    if (data.bairro) q = q.ilike("bairro", `%${data.bairro}%`);
    if (data.busca) q = q.or(`nome.ilike.%${data.busca}%,resumo.ilike.%${data.busca}%,profissao.ilike.%${data.busca}%`);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // marca quais a empresa já revelou (sem custo na próxima vez)
    const ids = (rows ?? []).map((r) => r.id);
    let revelados = new Set<string>();
    if (ids.length) {
      const { data: revs } = await supabaseAdmin
        .from("revelacoes").select("curriculo_id")
        .eq("empresa_id", userId).in("curriculo_id", ids);
      revelados = new Set((revs ?? []).map((r) => r.curriculo_id as string));
    }

    return (rows ?? []).map((r) => ({ ...r, ja_revelado: revelados.has(r.id) }));
  });

// ---------- KPIs do dashboard da empresa ----------

export const getEmpresaDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const [vagasAtivas, vagasTotais, candTotais, candNovas, revel, perfil, ilimitado] = await Promise.all([
      supabaseAdmin.from("vagas").select("id", { count: "exact", head: true }).eq("empresa_id", userId).eq("ativa", true),
      supabaseAdmin.from("vagas").select("id", { count: "exact", head: true }).eq("empresa_id", userId),
      supabaseAdmin.from("candidaturas").select("id", { count: "exact", head: true }).eq("empresa_id", userId),
      supabaseAdmin.from("candidaturas").select("id", { count: "exact", head: true })
        .eq("empresa_id", userId)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabaseAdmin.from("revelacoes").select("id", { count: "exact", head: true }).eq("empresa_id", userId),
      supabaseAdmin.from("profiles").select("verificada,slug_publico").eq("id", userId).maybeSingle(),
      temAssinaturaAtiva(userId),
    ]);

    const usadas = revel.count ?? 0;
    return {
      vagas_ativas: vagasAtivas.count ?? 0,
      vagas_totais: vagasTotais.count ?? 0,
      candidaturas_totais: candTotais.count ?? 0,
      candidaturas_7d: candNovas.count ?? 0,
      contatos_usados: usadas,
      contatos_limite: ilimitado ? null : FREE_REVELACOES,
      contatos_restantes: ilimitado ? null : Math.max(0, FREE_REVELACOES - usadas),
      verificada: perfil.data?.verificada ?? false,
      tem_pagina: !!perfil.data?.slug_publico,
    };
  });
