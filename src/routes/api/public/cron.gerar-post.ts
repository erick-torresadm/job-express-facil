import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Pool de tópicos SEO de alto volume para o nicho de empregos populares no Brasil
const TOPICOS = [
  { titulo: "Como conseguir emprego de pedreiro em {cidade}", tags: ["pedreiro", "construção"] },
  { titulo: "Vagas de motorista de aplicativo em {cidade}: o que você precisa saber", tags: ["motorista", "aplicativo"] },
  { titulo: "Como ser entregador de iFood, Rappi e 99 em {cidade}", tags: ["entregador", "delivery"] },
  { titulo: "Vagas de porteiro em {cidade}: salário, horários e como se candidatar", tags: ["porteiro", "segurança"] },
  { titulo: "Trabalho de auxiliar de cozinha em {cidade}: por onde começar", tags: ["cozinha", "restaurante"] },
  { titulo: "Como arrumar trabalho de babá em {cidade} com carteira assinada", tags: ["babá", "cuidados"] },
  { titulo: "Vagas de cuidador de idosos em {cidade}: requisitos e salário", tags: ["cuidador", "saúde"] },
  { titulo: "Trabalho de jardineiro em {cidade}: como conseguir clientes fixos", tags: ["jardineiro", "autônomo"] },
  { titulo: "Como ser eletricista autônomo em {cidade} e cobrar bem", tags: ["eletricista", "autônomo"] },
  { titulo: "Vagas de soldador em {cidade}: cursos rápidos que pagam o investimento", tags: ["soldador", "indústria"] },
  { titulo: "Trabalho de garçom em {cidade}: dicas para ganhar mais gorjeta", tags: ["garçom", "restaurante"] },
  { titulo: "Como conseguir vaga de operador de caixa em {cidade}", tags: ["caixa", "comércio"] },
  { titulo: "Vagas de costureira em {cidade}: trabalhar em casa ou em ateliê", tags: ["costureira", "moda"] },
  { titulo: "Trabalho de manicure em {cidade}: como montar clientela rápido", tags: ["manicure", "beleza"] },
  { titulo: "Como ser segurança em {cidade}: curso, salário e empresas que contratam", tags: ["segurança", "vigilante"] },
  { titulo: "Direitos do trabalhador doméstico em 2026: o que mudou", tags: ["direitos", "doméstica"] },
  { titulo: "Como pedir auxílio-desemprego em {cidade} passo a passo", tags: ["direitos", "desemprego"] },
  { titulo: "Carteira assinada vs MEI: qual vale mais a pena para autônomos", tags: ["mei", "carreira"] },
  { titulo: "Entrevista de emprego: 7 erros que fazem você ser eliminado", tags: ["entrevista", "dicas"] },
  { titulo: "Como negociar salário em vaga operacional sem perder a oportunidade", tags: ["salário", "carreira"] },
];

const CIDADES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre", "Salvador", "Brasília", "Fortaleza", "Recife", "Campinas"];

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

async function gerarPostComIA(titulo: string, tags: string[]) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY ausente");

  const system = `Você é redator SEO do blog VagasAgora (vagasagora.com.br), site brasileiro de empregos populares (pedreiro, doméstica, motorista, entregador, porteiro, etc).
Escreva em português brasileiro claro, direto, para quem tem ensino fundamental ou médio.
Estrutura obrigatória do artigo (campo "conteudo"):
- Comece com um parágrafo curto contextualizando (sem H1).
- Use H2 com "## Título" para cada seção (4 a 6 seções).
- Use listas com "- " quando fizer sentido.
- Use **negrito** para destacar valores, prazos e termos importantes.
- Tamanho total: entre 400 e 600 palavras.
- Inclua dados realistas de 2026 (faixas salariais, direitos, etc).
- Termine com uma seção "## Como o VagasAgora ajuda" com CTA para cadastro grátis.
NÃO inclua o título dentro do conteúdo.`;

  const prompt = `Crie um post de blog com:
- titulo: "${titulo}" (pode reformular ligeiramente para SEO, mantendo a palavra-chave principal)
- resumo: 1 frase de 140-160 caracteres com a palavra-chave principal
- conteudo: artigo completo em markdown conforme as regras
- tags: array com 3 a 5 tags relevantes (inclua estas como base: ${JSON.stringify(tags)})

Responda APENAS com JSON válido no formato:
{"titulo": "...", "resumo": "...", "conteudo": "...", "tags": ["..."]}`;

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("IA não retornou JSON");
  return JSON.parse(m[0]) as { titulo: string; resumo: string; conteudo: string; tags: string[] };
}

export const Route = createFileRoute("/api/public/cron/gerar-post")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Autenticação por header simples (compartilhado com pg_cron)
        const secret = request.headers.get("x-cron-secret");
        const expected = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!expected || secret !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        try {
          // Pega títulos já usados para não repetir
          const { data: existentes } = await supabaseAdmin
            .from("posts")
            .select("titulo")
            .order("published_at", { ascending: false })
            .limit(50);
          const usados = new Set((existentes ?? []).map((p) => p.titulo.toLowerCase()));

          const cidade = CIDADES[Math.floor(Math.random() * CIDADES.length)];
          const candidatos = TOPICOS
            .map((t) => ({ ...t, titulo: t.titulo.replace("{cidade}", cidade) }))
            .filter((t) => !usados.has(t.titulo.toLowerCase()));

          if (candidatos.length === 0) {
            return Response.json({ ok: true, skipped: true, reason: "todos os tópicos já cobertos" });
          }

          const escolhido = candidatos[Math.floor(Math.random() * candidatos.length)];
          const gerado = await gerarPostComIA(escolhido.titulo, escolhido.tags);

          let slug = slugify(gerado.titulo);
          // garantir unicidade
          const { data: dup } = await supabaseAdmin.from("posts").select("slug").eq("slug", slug).maybeSingle();
          if (dup) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

          const { data: novo, error } = await supabaseAdmin
            .from("posts")
            .insert({
              slug,
              titulo: gerado.titulo,
              resumo: gerado.resumo.slice(0, 220),
              conteudo: gerado.conteudo,
              tags: gerado.tags ?? escolhido.tags,
              autor: "Equipe VagasAgora",
              publicado: true,
            })
            .select("slug,titulo")
            .single();

          if (error) throw error;

          return Response.json({ ok: true, post: novo });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },
    },
  },
});
