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
