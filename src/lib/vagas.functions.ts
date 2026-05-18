import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type VagaPublica = {
  id: string;
  titulo: string;
  empresa_nome: string;
  salario: string;
  horario: string;
  bairro: string;
  cidade: string;
  profissao: string;
  profissao_slug: string;
  descricao: string | null;
  urgente: boolean;
  created_at: string;
};

export const listarVagasPublicas = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        profissaoSlug: z.string().min(1).max(100).optional(),
        cidade: z.string().min(1).max(100).optional(),
        limit: z.number().int().min(1).max(50).default(20),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("vagas")
      .select(
        "id,titulo,empresa_nome,salario,horario,bairro,cidade,profissao,profissao_slug,descricao,urgente,created_at",
      )
      .eq("ativa", true)
      .order("urgente", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.profissaoSlug) q = q.eq("profissao_slug", data.profissaoSlug);
    if (data.cidade) q = q.ilike("cidade", data.cidade);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { vagas: (rows ?? []) as VagaPublica[] };
  });
