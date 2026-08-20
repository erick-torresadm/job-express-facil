import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { haversineKm } from "@/lib/intel.functions";

// Raio (km) usado quando nem a vaga nem a empresa configuraram um valor.
export const RAIO_KM_DEFAULT = 20;

export type VagaPublica = {
  id: string;
  empresa_id: string;
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
  raio_km: number | null;
  regime: string;
  distancia_km: number | null;
  empresa_logo_url: string | null;
  empresa_slug_publico: string | null;
};

export const listarVagasPublicas = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        profissaoSlug: z.string().min(1).max(100).optional(),
        cidade: z.string().min(1).max(100).optional(),
        regime: z.enum(["clt", "pj", "estagio", "outros"]).optional(),
        q: z.string().trim().min(1).max(100).optional(),
        urgente: z.boolean().optional(),
        limit: z.number().int().min(1).max(80).default(20),
        // Quando informados, ativa o modo "perto de mim": filtra pelo raio
        // de cada vaga (ou o padrão da empresa/global) e ordena por distância.
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("vagas")
      .select(
        "id,empresa_id,titulo,empresa_nome,salario,horario,bairro,cidade,profissao,profissao_slug,descricao,urgente,created_at,latitude,longitude,endereco,requisitos,perguntas_triagem,faixa_salarial_sugerida,risco_fraude,risco_motivo,custo_alimentacao_mes,raio_km,regime",
      )
      .eq("ativa", true)
      .lt("risco_fraude", 70) // esconde vagas com forte indício de golpe
      .order("urgente", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(data.lat != null && data.lng != null ? 300 : data.limit);
    if (data.profissaoSlug) q = q.eq("profissao_slug", data.profissaoSlug);
    if (data.cidade) q = q.ilike("cidade", data.cidade);
    if (data.regime) q = q.eq("regime", data.regime);
    if (data.urgente) q = q.eq("urgente", true);
    if (data.q) q = q.or(`titulo.ilike.%${data.q}%,empresa_nome.ilike.%${data.q}%,profissao.ilike.%${data.q}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    let vagas: VagaPublica[] = (rows ?? []).map((r) => ({
      ...(r as Record<string, unknown>),
      requisitos: Array.isArray(r.requisitos) ? (r.requisitos as unknown[]).map(String) : [],
      perguntas_triagem: Array.isArray(r.perguntas_triagem) ? (r.perguntas_triagem as unknown[]).map(String) : [],
      distancia_km: null,
      empresa_logo_url: null,
      empresa_slug_publico: null,
    })) as VagaPublica[];

    // Logo + link da página de captação — enriquece o schema JobPosting
    // (hiringOrganization.logo) e conecta a vaga de volta à página da
    // empresa, sem custo extra relevante.
    if (vagas.length > 0) {
      const empresaIdsAll = [...new Set(vagas.map((v) => v.empresa_id))];
      const { data: perfis } = await supabaseAdmin
        .from("profiles")
        .select("id, logo_url, slug_publico")
        .in("id", empresaIdsAll);
      const perfilPorEmpresa = new Map((perfis ?? []).map((p) => [p.id, p]));
      vagas = vagas.map((v) => {
        const p = perfilPorEmpresa.get(v.empresa_id);
        return { ...v, empresa_logo_url: p?.logo_url ?? null, empresa_slug_publico: p?.slug_publico ?? null };
      });
    }

    if (data.lat != null && data.lng != null) {
      const empresaIds = [...new Set(vagas.map((v) => v.empresa_id))];
      const { data: empresas } = await supabaseAdmin
        .from("profiles")
        .select("id, raio_km_padrao")
        .in("id", empresaIds);
      const raioPorEmpresa = new Map((empresas ?? []).map((e) => [e.id, e.raio_km_padrao as number | null]));

      vagas = vagas
        .filter((v) => v.latitude != null && v.longitude != null)
        .map((v) => {
          const dist = haversineKm(data.lat!, data.lng!, v.latitude!, v.longitude!);
          return { ...v, distancia_km: Math.round(dist * 10) / 10 };
        })
        .filter((v) => {
          const raio = v.raio_km ?? raioPorEmpresa.get(v.empresa_id) ?? RAIO_KM_DEFAULT;
          return v.distancia_km! <= raio;
        })
        .sort((a, b) => a.distancia_km! - b.distancia_km!)
        .slice(0, data.limit);
    }

    return { vagas };
  });
