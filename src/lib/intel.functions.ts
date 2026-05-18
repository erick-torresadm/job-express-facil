import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rateLimit } from "@/lib/rate-limit.server";

// =================================================================
// Geocodificação via Nominatim (OpenStreetMap) — grátis, sem chave
// Política: 1 req/s, User-Agent customizado. Cache no banco.
// =================================================================
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";
const UA = "VagasAgora/1.0 (contato@vagasagora.com.br)";

export const geocodificarEndereco = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      endereco: z.string().min(3).max(200),
      cidade: z.string().min(2).max(80),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const q = `${data.endereco}, ${data.cidade}, Brasil`;
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=br`;
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!res.ok) return { latitude: null, longitude: null, displayName: null };
    const arr = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!arr.length) return { latitude: null, longitude: null, displayName: null };
    return {
      latitude: parseFloat(arr[0].lat),
      longitude: parseFloat(arr[0].lon),
      displayName: arr[0].display_name,
    };
  });

// =================================================================
// Distância + custo de transporte + alimentação
// =================================================================
// Tabela de tarifas de transporte público (R$) - 2026
const TARIFA_TRANSPORTE: Record<string, { unitario: number; mensal: number }> = {
  "São Paulo": { unitario: 5.0, mensal: 230 },
  "Rio de Janeiro": { unitario: 7.9, mensal: 357 },
  "Belo Horizonte": { unitario: 6.0, mensal: 264 },
  "Curitiba": { unitario: 6.5, mensal: 286 },
  "Porto Alegre": { unitario: 5.9, mensal: 259 },
  "Salvador": { unitario: 5.9, mensal: 259 },
  "Brasília": { unitario: 5.5, mensal: 242 },
  "Fortaleza": { unitario: 4.5, mensal: 198 },
  "Recife": { unitario: 4.4, mensal: 193 },
  "Campinas": { unitario: 5.6, mensal: 246 },
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export const calcularRotaCusto = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      origemLat: z.number(), origemLng: z.number(),
      destinoLat: z.number(), destinoLng: z.number(),
      cidade: z.string().default("São Paulo"),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    let km = 0;
    let minutosCarro = 0;

    try {
      const url = `${OSRM_URL}/${data.origemLng},${data.origemLat};${data.destinoLng},${data.destinoLat}?overview=false`;
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.ok) {
        const j = (await res.json()) as { routes?: Array<{ distance: number; duration: number }> };
        if (j.routes?.[0]) {
          km = j.routes[0].distance / 1000;
          minutosCarro = Math.round(j.routes[0].duration / 60);
        }
      }
    } catch { /* fallback abaixo */ }

    // Fallback: distância em linha reta × 1.4 (fator urbano)
    if (km === 0) {
      km = haversineKm(data.origemLat, data.origemLng, data.destinoLat, data.destinoLng) * 1.4;
      minutosCarro = Math.round(km * 2.5); // ~24 km/h em cidade
    }

    // Transporte público: ~1.7x carro
    const minutosTransporte = Math.round(minutosCarro * 1.7);
    // A pé: ~5 km/h
    const minutosPe = Math.round((km / 5) * 60);

    const tarifa = TARIFA_TRANSPORTE[data.cidade] ?? TARIFA_TRANSPORTE["São Paulo"];
    // 2 viagens × 22 dias úteis, OU mensal (o que for menor)
    const custoDiario = tarifa.unitario * 2;
    const custoMensalUnitario = custoDiario * 22;
    const custoMensal = Math.min(custoMensalUnitario, tarifa.mensal);

    return {
      km: Math.round(km * 10) / 10,
      minutosCarro,
      minutosTransporte,
      minutosPe,
      custoDiario,
      custoMensal,
      tarifaUnitaria: tarifa.unitario,
      tarifaMensal: tarifa.mensal,
    };
  });

// =================================================================
// Lovable AI helper
// =================================================================
const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callLovableAI(system: string, user: string, json = true): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY não configurada");
  const res = await fetch(LOVABLE_AI, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (res.status === 429) throw new Error("IA com muitas requisições, tente em alguns segundos");
  if (res.status === 402) throw new Error("Créditos de IA esgotados. Recarregue em Configurações.");
  if (!res.ok) throw new Error(`IA falhou [${res.status}]`);
  const j = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return j.choices?.[0]?.message?.content?.trim() ?? "";
}

function parseJson<T>(s: string): T {
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("IA não retornou JSON válido");
  return JSON.parse(m[0]) as T;
}

// =================================================================
// Custo médio de alimentação no bairro (estimativa via IA)
// =================================================================
export const estimarCustoAlimentacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      bairro: z.string().min(2).max(80),
      cidade: z.string().min(2).max(80),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const sys = `Você é especialista em custo de vida no Brasil em 2026.
Estime o custo médio diário e mensal (22 dias úteis) de almoço para um trabalhador comum
em restaurantes populares, PFs e marmitas próximas a um endereço de trabalho.
Considere bairro de classe baixa/média/alta para calibrar o valor.
Responda APENAS JSON: {"diario_min": number, "diario_max": number, "mensal_medio": number, "observacao": "string curta"}.`;
    const usr = `Bairro: ${data.bairro}\nCidade: ${data.cidade}`;
    const raw = await callLovableAI(sys, usr);
    return parseJson<{ diario_min: number; diario_max: number; mensal_medio: number; observacao: string }>(raw);
  });

// =================================================================
// Sugestão de salário justo por profissão + cidade
// =================================================================
export const sugerirSalarioFaixa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      profissao: z.string().min(2).max(80),
      cidade: z.string().min(2).max(80),
      horario: z.string().max(80).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const sys = `Você conhece o mercado de trabalho brasileiro em 2026 para profissões operacionais.
Dê a faixa salarial mensal de referência (mínimo, médio, máximo) considerando:
- piso da categoria/convenção quando existir
- prática local da cidade
- jornada CLT 44h se nada for dito
Responda APENAS JSON: {"min": number, "medio": number, "max": number, "fonte": "string curta"}.
Valores em reais (R$), sem decimais.`;
    const usr = `Profissão: ${data.profissao}\nCidade: ${data.cidade}\nJornada: ${data.horario ?? "CLT"}`;
    const raw = await callLovableAI(sys, usr);
    return parseJson<{ min: number; medio: number; max: number; fonte: string }>(raw);
  });

// =================================================================
// Anti-golpe: avalia descrição da vaga
// =================================================================
export const analisarVagaFraude = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      titulo: z.string().min(2).max(200),
      descricao: z.string().min(2).max(4000),
      salario: z.string().max(80),
      empresa: z.string().max(120),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const sys = `Você é analista anti-fraude de vagas de emprego no Brasil. Avalie sinais de golpe:
- pede dinheiro/depósito/PIX adiantado
- promete salário muito acima da média sem requisitos claros
- contato só por WhatsApp pessoal sem CNPJ
- linguagem urgente/sensacionalista ("ganhe R$10mil em casa!")
- pirâmide / marketing multinível disfarçado
- exige compra de kit/material

Pontue de 0 a 100 o risco de ser golpe (0 = vaga legítima, 100 = golpe claro).
Responda APENAS JSON: {"risco": number, "motivos": ["string", "..."], "veredito": "legitima"|"suspeita"|"golpe"}.`;
    const usr = `Empresa: ${data.empresa}\nTítulo: ${data.titulo}\nSalário: ${data.salario}\nDescrição: ${data.descricao}`;
    const raw = await callLovableAI(sys, usr);
    return parseJson<{ risco: number; motivos: string[]; veredito: "legitima" | "suspeita" | "golpe" }>(raw);
  });

// =================================================================
// Perguntas de pré-triagem geradas pela IA
// =================================================================
export const gerarPerguntasTriagem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      titulo: z.string().min(2).max(200),
      profissao: z.string().min(2).max(80),
      descricao: z.string().max(4000).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const sys = `Você é recrutador. Crie 3 perguntas-chave de pré-triagem (curtas, diretas, respondíveis em 1 frase)
que filtrem candidatos para a vaga. Foque em experiência prática, disponibilidade e requisitos eliminatórios.
Responda APENAS JSON: {"perguntas": ["pergunta 1?", "pergunta 2?", "pergunta 3?"]}.`;
    const usr = `Vaga: ${data.titulo}\nProfissão: ${data.profissao}\nDescrição: ${data.descricao ?? "—"}`;
    const raw = await callLovableAI(sys, usr);
    return parseJson<{ perguntas: string[] }>(raw);
  });

// =================================================================
// Match score candidato ↔ vaga (lógica pura, sem custo de IA)
// =================================================================
export type MatchInput = {
  candidato: {
    profissao: string;
    cidade?: string | null;
    bairro?: string | null;
    habilidades?: string[];
    pretensao_salarial?: string | null;
  };
  vaga: {
    profissao: string;
    cidade: string;
    bairro: string;
    salario: string;
    requisitos?: string[];
  };
  kmDistancia?: number | null;
};

export function calcularMatchScore({ candidato, vaga, kmDistancia }: MatchInput) {
  let score = 0;
  const fatores: string[] = [];

  // Profissão (40 pts)
  if (candidato.profissao.toLowerCase() === vaga.profissao.toLowerCase()) {
    score += 40;
    fatores.push("Profissão bate ✓");
  } else if (candidato.profissao.toLowerCase().includes(vaga.profissao.toLowerCase().split(" ")[0])) {
    score += 25;
    fatores.push("Profissão relacionada");
  }

  // Cidade (15 pts)
  if (candidato.cidade && candidato.cidade.toLowerCase() === vaga.cidade.toLowerCase()) {
    score += 15;
    fatores.push("Mesma cidade ✓");
  }

  // Bairro próximo via KM (20 pts)
  if (typeof kmDistancia === "number") {
    if (kmDistancia <= 3) { score += 20; fatores.push(`Perto: ${kmDistancia} km`); }
    else if (kmDistancia <= 8) { score += 15; fatores.push(`${kmDistancia} km`); }
    else if (kmDistancia <= 15) { score += 8; fatores.push(`${kmDistancia} km`); }
    else { fatores.push(`Longe: ${kmDistancia} km`); }
  } else if (candidato.bairro && candidato.bairro.toLowerCase() === vaga.bairro.toLowerCase()) {
    score += 20;
    fatores.push("Mesmo bairro ✓");
  }

  // Habilidades x requisitos (25 pts)
  const reqs = (vaga.requisitos ?? []).map((r) => r.toLowerCase());
  const habs = (candidato.habilidades ?? []).map((h) => h.toLowerCase());
  if (reqs.length > 0) {
    const matches = reqs.filter((r) => habs.some((h) => h.includes(r) || r.includes(h)));
    const pct = matches.length / reqs.length;
    const pts = Math.round(25 * pct);
    score += pts;
    if (matches.length > 0) fatores.push(`${matches.length}/${reqs.length} requisitos ✓`);
  } else {
    score += 12; // sem requisitos, dá benefício da dúvida
  }

  return { score: Math.min(100, score), fatores };
}
