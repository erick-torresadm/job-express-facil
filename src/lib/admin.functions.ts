import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Helper interno: garante que o usuário autenticado tem role 'admin'.
async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas administradores.");
}

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const [
      { count: totalUsuarios },
      { count: totalCandidatos },
      { count: totalEmpresas },
      { count: vagasAtivas },
      { count: vagasTotal },
      { count: candidaturas },
      { count: curriculos },
      { count: verifPendentes },
      { count: anunciosAtivos },
      novasVagas7d,
      candidaturas7d,
      vagasRiscoData,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "candidato"),
      supabaseAdmin.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "empresa"),
      supabaseAdmin.from("vagas").select("id", { count: "exact", head: true }).eq("ativa", true),
      supabaseAdmin.from("vagas").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("candidaturas").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("curriculos").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("verificacoes").select("id", { count: "exact", head: true }).eq("status", "pendente"),
      supabaseAdmin.from("anuncios").select("id", { count: "exact", head: true }).eq("ativo", true),
      supabaseAdmin.from("vagas").select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
      supabaseAdmin.from("candidaturas").select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
      supabaseAdmin.from("vagas").select("id", { count: "exact", head: true })
        .gte("risco_fraude", 50).eq("ativa", true),
    ]);

    return {
      totalUsuarios: totalUsuarios ?? 0,
      totalCandidatos: totalCandidatos ?? 0,
      totalEmpresas: totalEmpresas ?? 0,
      vagasAtivas: vagasAtivas ?? 0,
      vagasTotal: vagasTotal ?? 0,
      candidaturas: candidaturas ?? 0,
      curriculos: curriculos ?? 0,
      verifPendentes: verifPendentes ?? 0,
      anunciosAtivos: anunciosAtivos ?? 0,
      novasVagas7d: novasVagas7d.count ?? 0,
      candidaturas7d: candidaturas7d.count ?? 0,
      vagasRisco: vagasRiscoData.count ?? 0,
    };
  });

export const listarVagasAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      filtro: z.enum(["todas", "ativas", "inativas", "risco"]).default("todas"),
      busca: z.string().trim().max(120).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    let q = supabaseAdmin
      .from("vagas")
      .select("id,titulo,empresa_nome,cidade,bairro,salario,ativa,risco_fraude,risco_motivo,created_at,empresa_id,profissao_slug")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data.filtro === "ativas") q = q.eq("ativa", true);
    if (data.filtro === "inativas") q = q.eq("ativa", false);
    if (data.filtro === "risco") q = q.gte("risco_fraude", 50);
    if (data.busca) q = q.or(`titulo.ilike.%${data.busca}%,empresa_nome.ilike.%${data.busca}%`);

    const { data: vagas, error } = await q;
    if (error) throw new Error(error.message);
    return vagas ?? [];
  });

export const toggleVagaAtivaAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), ativa: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("vagas").update({ ativa: data.ativa }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removerVagaAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("vagas").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listarUsuariosAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      role: z.enum(["todos", "candidato", "empresa", "admin"]).default("todos"),
      busca: z.string().trim().max(120).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    let q = supabaseAdmin
      .from("profiles")
      .select("id,full_name,company_name,whatsapp,handle,verificada,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.busca) {
      q = q.or(`full_name.ilike.%${data.busca}%,company_name.ilike.%${data.busca}%,whatsapp.ilike.%${data.busca}%`);
    }
    const { data: profs, error } = await q;
    if (error) throw new Error(error.message);

    const ids = (profs ?? []).map((p) => p.id);
    const { data: roles } = ids.length
      ? await supabaseAdmin.from("user_roles").select("user_id,role").in("user_id", ids)
      : { data: [] as { user_id: string; role: string }[] };

    const rolesMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = rolesMap.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    }

    let merged = (profs ?? []).map((p) => ({ ...p, roles: rolesMap.get(p.id) ?? [] }));
    if (data.role !== "todos") merged = merged.filter((u) => u.roles.includes(data.role));
    return merged;
  });

// ============ KPIs de VISITAS (admin dashboard) ============
export const getVisitStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const now = new Date();
    const days = 30;
    const start = new Date(now.getTime() - days * 86400000);
    const startISO = start.toISOString();
    const start7 = new Date(now.getTime() - 7 * 86400000).toISOString();
    const start24 = new Date(now.getTime() - 86400000).toISOString();

    // pega visitas humanas dos últimos 30d
    const { data: rows, error } = await supabaseAdmin
      .from("page_views")
      .select("path,referrer_host,country,ua_device,session_id,user_id,created_at,is_bot")
      .gte("created_at", startISO)
      .eq("is_bot", false)
      .limit(50000);
    if (error) throw new Error(error.message);

    const all = rows ?? [];

    // totais
    const total30 = all.length;
    const sessions30 = new Set(all.map((r) => r.session_id)).size;
    const rows7 = all.filter((r) => r.created_at >= start7);
    const rows24 = all.filter((r) => r.created_at >= start24);
    const total7 = rows7.length;
    const sessions7 = new Set(rows7.map((r) => r.session_id)).size;
    const total24 = rows24.length;
    const sessions24 = new Set(rows24.map((r) => r.session_id)).size;

    // série diária (30d)
    const byDay = new Map<string, { views: number; sessions: Set<string> }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
      byDay.set(d, { views: 0, sessions: new Set() });
    }
    for (const r of all) {
      const d = r.created_at.slice(0, 10);
      const b = byDay.get(d);
      if (!b) continue;
      b.views += 1;
      b.sessions.add(r.session_id);
    }
    const serieDiaria = Array.from(byDay.entries()).map(([dia, v]) => ({
      dia,
      visitas: v.views,
      sessoes: v.sessions.size,
    }));

    // top páginas
    const pathCount = new Map<string, number>();
    for (const r of all) pathCount.set(r.path, (pathCount.get(r.path) ?? 0) + 1);
    const topPaginas = [...pathCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([path, views]) => ({ path, views }));

    // top referrers
    const refCount = new Map<string, number>();
    for (const r of all) {
      const h = r.referrer_host ?? "(direto)";
      refCount.set(h, (refCount.get(h) ?? 0) + 1);
    }
    const topReferrers = [...refCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([source, views]) => ({ source, views }));

    // dispositivos
    const devCount = new Map<string, number>();
    for (const r of all) {
      const d = r.ua_device ?? "desktop";
      devCount.set(d, (devCount.get(d) ?? 0) + 1);
    }
    const dispositivos = [...devCount.entries()].map(([nome, views]) => ({ nome, views }));

    // top países
    const paisCount = new Map<string, number>();
    for (const r of all) {
      const c = r.country ?? "??";
      paisCount.set(c, (paisCount.get(c) ?? 0) + 1);
    }
    const topPaises = [...paisCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([pais, views]) => ({ pais, views }));

    // funil de conversão (30d): visita → cadastro → currículo → candidatura
    const [{ count: cadastros30 }, { count: curriculos30 }, { count: candidaturas30 }] =
      await Promise.all([
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", startISO),
        supabaseAdmin.from("curriculos").select("id", { count: "exact", head: true }).gte("created_at", startISO),
        supabaseAdmin.from("candidaturas").select("id", { count: "exact", head: true }).gte("created_at", startISO),
      ]);

    const funil = [
      { etapa: "Visitas", valor: sessions30 },
      { etapa: "Cadastros", valor: cadastros30 ?? 0 },
      { etapa: "Currículos", valor: curriculos30 ?? 0 },
      { etapa: "Candidaturas", valor: candidaturas30 ?? 0 },
    ];

    return {
      periodo_dias: days,
      totais: {
        visitas_30d: total30,
        sessoes_30d: sessions30,
        visitas_7d: total7,
        sessoes_7d: sessions7,
        visitas_24h: total24,
        sessoes_24h: sessions24,
      },
      serie_diaria: serieDiaria,
      top_paginas: topPaginas,
      top_referrers: topReferrers,
      dispositivos,
      top_paises: topPaises,
      funil,
    };
  });

// ============ ADMIN EMPRESAS ============

export const listarEmpresasAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      busca: z.string().trim().max(120).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    // pega todas as empresas (perfis com company_name)
    let q = supabaseAdmin
      .from("profiles")
      .select("id,company_name,whatsapp,verificada,created_at,cpf_cnpj")
      .order("created_at", { ascending: false })
      .limit(500);

    if (data.busca) {
      q = q.or(`company_name.ilike.%${data.busca}%,cpf_cnpj.ilike.%${data.busca}%,whatsapp.ilike.%${data.busca}%`);
    }

    const { data: empresas, error } = await q;
    if (error) throw new Error(error.message);

    const empresaIds = (empresas ?? []).map((e) => e.id);

    // contadores de vagas ativas e candidaturas dos últimos 7 dias por empresa
    const [
      { data: vagasData },
      { data: candidaturasData },
    ] = await Promise.all([
      supabaseAdmin
        .from("vagas")
        .select("empresa_id,id")
        .in("empresa_id", empresaIds)
        .eq("ativa", true),
      supabaseAdmin
        .from("candidaturas")
        .select("empresa_id,id,created_at")
        .in("empresa_id", empresaIds)
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    ]);

    const vagasCount = new Map<string, number>();
    for (const v of vagasData ?? []) {
      vagasCount.set(v.empresa_id, (vagasCount.get(v.empresa_id) ?? 0) + 1);
    }

    const candidaturasCount = new Map<string, number>();
    for (const c of candidaturasData ?? []) {
      candidaturasCount.set(c.empresa_id, (candidaturasCount.get(c.empresa_id) ?? 0) + 1);
    }

    return (empresas ?? []).map((e) => ({
      ...e,
      cnpj: e.cpf_cnpj,
      email: undefined,
      vagas_ativas: vagasCount.get(e.id) ?? 0,
      candidaturas_7d: candidaturasCount.get(e.id) ?? 0,
    }));
  });

export const getEmpresaDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: empresa, error } = await supabaseAdmin
      .from("profiles")
      .select("id,company_name,whatsapp,logo_url,cor_primaria,sobre,slug_publico,verificada,created_at,cpf_cnpj,raio_km_padrao,latitude,longitude")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!empresa) throw new Error("Empresa não encontrada");
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(data.id);
    return { ...empresa, email: authUser?.user?.email ?? null, cnpj: empresa.cpf_cnpj };
  });

export const getEmpresaVagas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const { data: vagas, error } = await supabaseAdmin
      .from("vagas")
      .select("id,titulo,ativa,created_at")
      .eq("empresa_id", data.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);

    const vagaIds = (vagas ?? []).map((v) => v.id);

    // contar candidaturas + eventos (visualização/clique) por vaga
    const [{ data: candData }, { data: eventsData }] = await Promise.all([
      vagaIds.length
        ? supabaseAdmin.from("candidaturas").select("vaga_id,id").in("vaga_id", vagaIds)
        : Promise.resolve({ data: [] as { vaga_id: string; id: string }[] }),
      vagaIds.length
        ? supabaseAdmin.from("recruiter_events").select("vaga_id,tipo").in("vaga_id", vagaIds)
        : Promise.resolve({ data: [] as { vaga_id: string | null; tipo: string }[] }),
    ]);

    const candCount = new Map<string, number>();
    for (const c of candData ?? []) {
      candCount.set(c.vaga_id, (candCount.get(c.vaga_id) ?? 0) + 1);
    }

    const viewCount = new Map<string, number>();
    const clickCount = new Map<string, number>();
    for (const e of eventsData ?? []) {
      if (!e.vaga_id) continue;
      if (e.tipo === "vaga_view") viewCount.set(e.vaga_id, (viewCount.get(e.vaga_id) ?? 0) + 1);
      else if (e.tipo === "cv_click") clickCount.set(e.vaga_id, (clickCount.get(e.vaga_id) ?? 0) + 1);
    }

    return (vagas ?? []).map((v) => ({
      ...v,
      status: v.ativa,
      candidaturas_total: candCount.get(v.id) ?? 0,
      visualizacoes: viewCount.get(v.id) ?? 0,
      cliques: clickCount.get(v.id) ?? 0,
    }));
  });

export const getEmpresaCandidaturas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const { data: candidaturas, error } = await supabaseAdmin
      .from("candidaturas")
      .select("id,status,created_at,curriculo_id")
      .eq("empresa_id", data.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    const curriculoIds = (candidaturas ?? []).map((c) => c.curriculo_id);
    const { data: curriculos } = curriculoIds.length
      ? await supabaseAdmin.from("curriculos").select("id,nome,profissao").in("id", curriculoIds)
      : { data: [] as { id: string; nome: string; profissao: string }[] };

    const curriculoMap = new Map<string, { nome: string; profissao: string }>();
    for (const c of curriculos ?? []) {
      curriculoMap.set(c.id, { nome: c.nome, profissao: c.profissao });
    }

    return (candidaturas ?? []).map((c) => {
      const curriculo = curriculoMap.get(c.curriculo_id);
      return {
        ...c,
        nome_candidato: curriculo?.nome ?? "(desconhecido)",
        profissao_candidato: curriculo?.profissao ?? "(não informado)",
      };
    });
  });

export const getEmpresaAtividade = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    // pega vagas, candidaturas e atualizações de perfil da empresa
    const [
      { data: vagasData },
      { data: candidaturasData },
      { data: profileData },
    ] = await Promise.all([
      supabaseAdmin
        .from("vagas")
        .select("id,titulo,created_at")
        .eq("empresa_id", data.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("candidaturas")
        .select("id,created_at")
        .eq("empresa_id", data.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("profiles")
        .select("id,updated_at")
        .eq("id", data.id)
        .maybeSingle(),
    ]);

    const timeline: Array<{
      timestamp: string;
      tipo: "nova_vaga" | "candidatura" | "atualizacao_perfil";
      titulo: string;
      descricao?: string;
    }> = [];

    for (const v of vagasData ?? []) {
      timeline.push({
        timestamp: v.created_at,
        tipo: "nova_vaga",
        titulo: "Nova vaga publicada",
        descricao: v.titulo,
      });
    }

    for (const c of candidaturasData ?? []) {
      timeline.push({
        timestamp: c.created_at,
        tipo: "candidatura",
        titulo: "Nova candidatura",
      });
    }

    if (profileData?.updated_at) {
      timeline.push({
        timestamp: profileData.updated_at,
        tipo: "atualizacao_perfil",
        titulo: "Perfil atualizado",
      });
    }

    return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

// ============ ADMIN: PLANO/ASSINATURA MANUAL ============
// Pra empresas que pagaram por fora da plataforma — admin ativa/ajusta
// o plano direto, sem passar pela Asaas.

export const getAssinaturaAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: assinatura } = await supabaseAdmin
      .from("assinaturas")
      .select("id, plano, ciclo, status, valor, proximo_vencimento, created_at")
      .eq("empresa_id", data.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return assinatura ?? null;
  });

export const salvarAssinaturaAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      empresaId: z.string().uuid(),
      plano: z.enum(["basico", "full"]),
      ciclo: z.enum(["mensal", "anual"]),
      status: z.enum(["pendente", "ativa", "atrasada", "cancelada"]),
      valor: z.number().min(0).max(99999).optional().nullable(),
      proximoVencimento: z.string().optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const { data: existente } = await supabaseAdmin
      .from("assinaturas")
      .select("id")
      .eq("empresa_id", data.empresaId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const payload = {
      plano: data.plano,
      ciclo: data.ciclo,
      status: data.status,
      valor: data.valor ?? 0,
      proximo_vencimento: data.proximoVencimento || null,
    };

    if (existente) {
      const { error } = await supabaseAdmin.from("assinaturas").update(payload).eq("id", existente.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("assinaturas").insert({ ...payload, empresa_id: data.empresaId });
      if (error) throw new Error(error.message);
    }

    return { ok: true as const };
  });
