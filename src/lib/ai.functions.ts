import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rateLimit } from "@/lib/rate-limit.server";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

type Part =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

async function callGemini(system: string, parts: Part[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY não configurada");

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts }],
      generationConfig: { temperature: 0.5, responseMimeType: "application/json" },
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
  // Texto livre escrito pelo candidato (opcional)
  texto: z.string().max(4000).optional(),
  // Base64 puro (sem o prefixo data:) — opcional
  midiaBase64: z.string().max(15_000_000).optional(),
  midiaMimeType: z.string().max(80).optional(),
});

export type PerfilGerado = {
  resumo: string;
  experiencias: string[];
  habilidades: string[];
  dicas: string[];
  transcricao: string;
  slug: string;
};

export const analisarCandidato = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => analisarSchema.parse(d))
  .handler(async ({ data }): Promise<PerfilGerado> => {
    const sys =
      "Você é um redator de currículos para trabalhadores brasileiros do mercado operacional (pedreiro, doméstica, motorista, porteiro, ajudante, cozinheira, etc). Quando receber um áudio ou vídeo, PRIMEIRO transcreva fielmente o que a pessoa falou em português, e depois use APENAS o que foi dito para preencher experiências e habilidades. Não invente informação. Se a pessoa não falou sobre algo específico, deixe genérico mas honesto. Escreva em português brasileiro simples, direto e respeitoso. Sempre responda APENAS um JSON válido, sem markdown.";

    const temMidia = !!(data.midiaBase64 && data.midiaMimeType);
    const temTexto = !!(data.texto && data.texto.trim().length > 10);

    const fontes: string[] = [];
    if (temMidia) fontes.push(`${data.temVideo ? "um vídeo" : "um áudio"} de ${data.duracaoSegundos}s`);
    if (temTexto) fontes.push("um texto escrito pelo candidato");

    const instrucao = fontes.length > 0
      ? `O candidato forneceu: ${fontes.join(" e ")}. Use TODAS as fontes juntas para montar o currículo. Se houver mídia, transcreva e combine com o texto escrito. Não invente nada além do que foi dito/escrito.`
      : "O candidato não forneceu áudio, vídeo ou texto — gere um perfil base, modesto, baseado apenas na profissão.";

    const pedido = `${instrucao}

Dados do candidato:
- Nome: ${data.nome}
- Profissão declarada: ${data.profissao}
- Cidade: ${data.bairro}, ${data.cidade}
${temTexto ? `\nTexto escrito pelo candidato:\n"""\n${data.texto!.trim()}\n"""\n` : ""}
Responda em JSON EXATAMENTE neste formato:
{
  "transcricao": "${temMidia ? "transcrição literal e completa do que a pessoa falou na gravação, em português, pontuação natural" : ""}",
  "resumo": "1 frase curta (máx 140 caracteres) vendendo o candidato com base no que foi informado",
  "experiencias": ["3 a 6 bullets curtos, cada um descrevendo uma experiência REAL mencionada na gravação ou no texto (locais, tempo, tarefas). Se ambas as fontes forem vagas, gere bullets típicos da profissão"],
  "habilidades": ["4 a 10 habilidades práticas em 1-3 palavras cada, EXTRAÍDAS do que a pessoa contou"],
  "dicas": ["2 dicas curtas e práticas pro candidato conseguir mais entrevistas"]
}`;

    const parts: Part[] = [{ text: pedido }];
    if (temMidia) {
      parts.push({
        inline_data: {
          mime_type: data.midiaMimeType!,
          data: data.midiaBase64!,
        },
      });
    }

    const text = await callGemini(sys, parts);
    const perfil = extractJson<Omit<PerfilGerado, "slug">>(text);

    const slug = `${slugify(data.nome)}-${Math.random().toString(36).slice(2, 8)}`;
    const { error } = await supabaseAdmin.from("curriculos").insert({
      slug,
      nome: data.nome,
      email: data.email,
      whatsapp: data.whatsapp,
      profissao: data.profissao,
      bairro: data.bairro,
      cidade: data.cidade,
      resumo: perfil.resumo,
      experiencias: perfil.experiencias,
      habilidades: perfil.habilidades,
      dicas: perfil.dicas,
      transcricao: perfil.transcricao ?? "",
      tem_audio: data.temAudio,
      tem_video: data.temVideo,
      duracao_segundos: data.duracaoSegundos,
    });
    if (error) throw new Error(`Erro ao salvar currículo: ${error.message}`);

    return { ...perfil, slug };
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
    const text = await callGemini(sys, [{ text: user }]);
    return extractJson(text);
  });
