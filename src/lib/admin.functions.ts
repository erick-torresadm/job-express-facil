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
