import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function callGemini(system: string, user: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY não configurada");

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
    }),
  });

  if (res.status === 429) throw new Error("Muitas requisições. Tente novamente em alguns segundos.");
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Gemini falhou [${res.status}]: ${txt.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

function extractJson<T>(text: string): T {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Resposta da IA sem JSON");
  return JSON.parse(m[0]) as T;
}

// ===== Candidato =====
const analisarSchema = z.object({
  nome: z.string().min(1).max(120),
  email: z.string().email().max(160),
  whatsapp: z.string().min(8).max(20),
  profissao: z.string().min(1).max(80),
  bairro: z.string().min(1).max(80),
  cidade: z.string().min(1).max(80),
  temAudio: z.boolean(),
  temVideo: z.boolean(),
  duracaoSegundos: z.number().min(0).max(120),
});

export type PerfilGerado = {
  resumo: string;
  experiencias: string[];
  habilidades: string[];
  dicas: string[];
};

export const analisarCandidato = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => analisarSchema.parse(d))
  .handler(async ({ data }): Promise<PerfilGerado> => {
    const sys =
      "Você é um redator de currículos para trabalhadores brasileiros do mercado operacional (pedreiro, doméstica, motorista, porteiro, ajudante). Escreva em português brasileiro simples, direto e respeitoso. Sempre responda com APENAS um JSON válido no formato pedido, sem markdown.";

    const mid = data.temVideo
      ? `O candidato gravou um vídeo de ${data.duracaoSegundos}s contando suas experiências.`
      : data.temAudio
        ? `O candidato gravou um áudio de ${data.duracaoSegundos}s contando suas experiências.`
        : "O candidato não gravou áudio nem vídeo — gere um perfil base só com a profissão.";

    const user = `Monte um perfil profissional para o candidato abaixo.

Nome: ${data.nome}
Profissão: ${data.profissao}
Mora em: ${data.bairro}, ${data.cidade}
${mid}

Responda em JSON com este formato exato:
{
  "resumo": "1 frase curta vendendo o candidato (máx 140 caracteres)",
  "experiencias": ["3 a 4 bullets curtos de experiência típica de quem trabalha como ${data.profissao}"],
  "habilidades": ["4 a 6 habilidades práticas em 1-2 palavras cada"],
  "dicas": ["2 dicas curtas pro candidato conseguir mais entrevistas"]
}`;

    const text = await callGemini(sys, user);
    return extractJson<PerfilGerado>(text);
  });

// ===== Empresa =====
const vagaSchema = z.object({
  titulo: z.string().min(2).max(120),
  profissao: z.string().min(2).max(80),
  bairro: z.string().min(1).max(80),
  salario: z.string().min(1).max(60),
  horario: z.string().min(1).max(80),
});

export const gerarDescricaoVaga = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => vagaSchema.parse(d))
  .handler(async ({ data }): Promise<{ descricao: string; requisitos: string[] }> => {
    const sys =
      "Você escreve anúncios de vaga para mercado operacional brasileiro. Linguagem simples, sem jargão de RH. Responda APENAS JSON válido, sem markdown.";
    const user = `Escreva uma vaga clara e atrativa:

Título: ${data.titulo}
Profissão: ${data.profissao}
Bairro: ${data.bairro}
Salário: ${data.salario}
Horário: ${data.horario}

Responda em JSON:
{
  "descricao": "2 a 3 frases convidando o candidato a se inscrever, em tom acolhedor",
  "requisitos": ["3 a 5 requisitos práticos curtos"]
}`;
    const text = await callGemini(sys, user);
    return extractJson(text);
  });
