import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Lovable AI Gateway (Gemini grátis via créditos do workspace)
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL_TREND = "google/gemini-2.5-flash";
const MODEL_WRITE = "google/gemini-2.5-flash";

const CIDADES = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre",
  "Salvador", "Brasília", "Fortaleza", "Recife", "Campinas", "Goiânia", "Manaus",
  "Guarulhos", "São Bernardo do Campo", "Osasco", "Santo André", "Niterói",
  "Duque de Caxias", "Nova Iguaçu", "Ribeirão Preto", "Sorocaba", "São José dos Campos",
];

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

async function aiJson<T>(system: string, user: string, model = MODEL_WRITE): Promise<T> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY ausente");
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI Gateway ${res.status}: ${t.slice(0, 300)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = json.choices?.[0]?.message?.content?.trim() ?? "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("IA não retornou JSON");
  return JSON.parse(m[0]) as T;
}

// Pesquisa de tendências via IA: combina profissão × cidade × intenção de busca
async function pesquisarTendencias(quantidade: number, evitar: string[]) {
  const cidades = Array.from({ length: quantidade }, () => CIDADES[Math.floor(Math.random() * CIDADES.length)]);
  const system = `Você é especialista em SEO para o nicho de empregos populares no Brasil em 2026.
Sugira títulos de posts de blog com ALTO potencial de tráfego orgânico no Google Brasil.
Foque em long-tail: profissão + cidade + intenção (salário, como conseguir, vagas, direitos, CLT vs MEI, sem experiência, curso, entrevista, melhor empresa).
Cubra tanto o lado do CANDIDATO (vagas, salário, direitos, primeiro emprego) quanto da EMPRESA (CLT, encargos, terceirização, como contratar).
Inclua profissões operacionais de alta demanda: pedreiro, motorista, entregador, porteiro, cozinheiro, doméstica, diarista, motoboy, soldador, eletricista, cuidador, babá, vendedor, repositor, recepcionista, segurança, manicure, costureira, garçom, auxiliar de limpeza, jardineiro, ajudante.`;

  const user = `Gere ${quantidade} ideias de posts ÚNICAS, evitando esses títulos já publicados:
${evitar.slice(0, 40).map((t) => `- ${t}`).join("\n") || "(nenhum)"}

Use preferencialmente estas cidades (uma por título): ${cidades.join(", ")}.

Responda APENAS com JSON:
{"ideias":[{"titulo":"...","palavra_chave":"...","tags":["3-5 tags lowercase"]}]}`;

  const out = await aiJson<{ ideias: Array<{ titulo: string; palavra_chave: string; tags: string[] }> }>(
    system, user, MODEL_TREND
  );
  return out.ideias ?? [];
}

async function gerarConteudo(titulo: string, palavraChave: string, tags: string[]) {
  const system = `Você é redator SEO do blog VagasAgora (vagasagora.com.br), site brasileiro de empregos populares.
Escreva em português brasileiro claro, direto, para quem tem ensino fundamental ou médio.
Estrutura obrigatória:
- Parágrafo curto de abertura (sem H1, sem repetir o título).
- 4 a 6 seções com "## Título".
- Listas com "- " quando útil.
- **negrito** em valores, prazos e termos-chave.
- 500 a 750 palavras.
- Use a palavra-chave principal naturalmente 3-5 vezes.
- Dados realistas de 2026 (faixas salariais CLT, encargos, etc).
- Última seção "## Como o VagasAgora ajuda" com CTA para cadastro grátis.`;

  const user = `Título: "${titulo}"
Palavra-chave principal: "${palavraChave}"
Tags: ${JSON.stringify(tags)}

Responda APENAS JSON:
{"titulo":"${titulo}","resumo":"meta description 140-160 chars com a palavra-chave","conteudo":"markdown completo","tags":${JSON.stringify(tags)}}`;

  return aiJson<{ titulo: string; resumo: string; conteudo: string; tags: string[] }>(system, user);
}

async function criarUmPost(evitar: Set<string>) {
  const [ideia] = await pesquisarTendencias(1, Array.from(evitar));
  if (!ideia) throw new Error("IA não sugeriu ideia");
  if (evitar.has(ideia.titulo.toLowerCase())) throw new Error("título duplicado sugerido");

  const gerado = await gerarConteudo(ideia.titulo, ideia.palavra_chave, ideia.tags);
  let slug = slugify(gerado.titulo);
  const { data: dup } = await supabaseAdmin.from("posts").select("slug").eq("slug", slug).maybeSingle();
  if (dup) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const { data: novo, error } = await supabaseAdmin
    .from("posts")
    .insert({
      slug,
      titulo: gerado.titulo,
      resumo: gerado.resumo.slice(0, 220),
      conteudo: gerado.conteudo,
      tags: gerado.tags ?? ideia.tags,
      autor: "Equipe VagasAgora",
      publicado: true,
    })
    .select("slug,titulo")
    .single();

  if (error) throw error;
  evitar.add(novo.titulo.toLowerCase());
  return novo;
}

export const Route = createFileRoute("/api/public/cron/gerar-post")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Auth: header `x-cron-secret` must match server-only CRON_SECRET.
        // Never accept the Supabase publishable/anon key here — it is shipped
        // to every browser and would let anyone spam AI-generated posts.
        const expected = process.env.CRON_SECRET;
        const sent = request.headers.get("x-cron-secret") ?? "";
        if (!expected || sent.length !== expected.length) {
          return new Response("Unauthorized", { status: 401 });
        }
        // constant-time-ish compare
        let diff = 0;
        for (let i = 0; i < expected.length; i++) {
          diff |= expected.charCodeAt(i) ^ sent.charCodeAt(i);
        }
        if (diff !== 0) {
          return new Response("Unauthorized", { status: 401 });
        }

        const url = new URL(request.url);
        const qtd = Math.min(Math.max(parseInt(url.searchParams.get("qtd") ?? "1", 10) || 1, 1), 10);

        try {
          const { data: existentes } = await supabaseAdmin
            .from("posts")
            .select("titulo")
            .order("published_at", { ascending: false })
            .limit(120);
          const evitar = new Set((existentes ?? []).map((p) => p.titulo.toLowerCase()));

          const criados: Array<{ slug: string; titulo: string }> = [];
          const erros: string[] = [];

          for (let i = 0; i < qtd; i++) {
            try {
              const novo = await criarUmPost(evitar);
              criados.push(novo);
            } catch (e) {
              erros.push(e instanceof Error ? e.message : String(e));
            }
            // pequeno respiro entre chamadas para evitar rate limit
            if (i < qtd - 1) await new Promise((r) => setTimeout(r, 1500));
          }

          return Response.json({ ok: true, solicitados: qtd, criados, erros });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },
    },
  },
});
