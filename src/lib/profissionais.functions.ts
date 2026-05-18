import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Listagem PÚBLICA e ANÔNIMA de profissionais.
 * Retorna apenas profissão, bairro, cidade, resumo (truncado) e iniciais.
 * NUNCA expõe nome completo, email, whatsapp, slug do CV ou user_id.
 * Objetivo: SEO para que empregadores encontrem categorias de profissionais
 * por cidade no Google sem expor PII.
 */
export const listarProfissionaisPublicos = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        profissao: z.string().min(1).max(120).optional(),
        cidade: z.string().min(1).max(120).optional(),
        limit: z.number().int().min(1).max(60).default(30),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("curriculos")
      .select("id, profissao, bairro, cidade, resumo, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (data.profissao) q = q.ilike("profissao", `%${data.profissao}%`);
    if (data.cidade) q = q.ilike("cidade", `%${data.cidade}%`);

    const { data: rows, error } = await q;
    if (error) {
      console.error("listarProfissionaisPublicos error", error);
      return { profissionais: [], total: 0 };
    }

    const profissionais = (rows ?? []).map((r) => ({
      id: r.id,
      profissao: r.profissao,
      bairro: r.bairro ?? null,
      cidade: r.cidade ?? null,
      // Truncamos resumo para 220 chars e não expomos contato algum
      resumo: (r.resumo ?? "").slice(0, 220),
      cadastradoEm: r.created_at,
    }));

    return { profissionais, total: profissionais.length };
  });

export const contarPorCategoria = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({ cidade: z.string().min(1).max(120).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin.from("curriculos").select("profissao", { count: "exact" });
    if (data.cidade) q = q.ilike("cidade", `%${data.cidade}%`);
    const { data: rows } = await q;
    const counts: Record<string, number> = {};
    (rows ?? []).forEach((r: { profissao: string }) => {
      const k = (r.profissao ?? "").toLowerCase();
      counts[k] = (counts[k] ?? 0) + 1;
    });
    return { counts };
  });
