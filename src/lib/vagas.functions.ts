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
  latitude: number | null;
  longitude: number | null;
  endereco: string | null;
  requisitos: string[];
  perguntas_triagem: string[];
  faixa_salarial_sugerida: string | null;
  risco_fraude: number;
  risco_motivo: string | null;
  custo_alimentacao_mes: number | null;
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
        "id,titulo,empresa_nome,salario,horario,bairro,cidade,profissao,profissao_slug,descricao,urgente,created_at,latitude,longitude,endereco,requisitos,perguntas_triagem,faixa_salarial_sugerida,risco_fraude,risco_motivo,custo_alimentacao_mes",
      )
      .eq("ativa", true)
      .lt("risco_fraude", 70) // esconde vagas com forte indício de golpe
      .order("urgente", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.profissaoSlug) q = q.eq("profissao_slug", data.profissaoSlug);
    if (data.cidade) q = q.ilike("cidade", data.cidade);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const vagas: VagaPublica[] = (rows ?? []).map((r) => ({
      ...(r as Record<string, unknown>),
      requisitos: Array.isArray(r.requisitos) ? (r.requisitos as unknown[]).map(String) : [],
      perguntas_triagem: Array.isArray(r.perguntas_triagem) ? (r.perguntas_triagem as unknown[]).map(String) : [],
    })) as VagaPublica[];
    return { vagas };
  });
