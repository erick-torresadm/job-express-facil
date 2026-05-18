import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Lovable AI Gateway (Gemini grátis via créditos do workspace, sem API key do Google)
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

// Principais termos de busca de emprego no Brasil (alto volume no Google)
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
  { titulo: "Vagas de empregada doméstica em {cidade}: direitos e salário 2026", tags: ["doméstica", "direitos"] },
  { titulo: "Trabalho de diarista em {cidade}: quanto cobrar por dia", tags: ["diarista", "autônomo"] },
  { titulo: "Vagas de repositor de supermercado em {cidade}", tags: ["repositor", "comércio"] },
  { titulo: "Como conseguir emprego de auxiliar de limpeza em {cidade}", tags: ["limpeza", "auxiliar"] },
  { titulo: "Vagas de motoboy em {cidade}: ganho mensal real", tags: ["motoboy", "entregador"] },
  { titulo: "Trabalho de recepcionista em {cidade}: o que pedem na entrevista", tags: ["recepcionista", "atendimento"] },
  { titulo: "Como ser ajudante de pedreiro em {cidade} sem experiência", tags: ["ajudante", "construção"] },
  { titulo: "Vagas de vendedor em {cidade}: comissão vs salário fixo", tags: ["vendedor", "comércio"] },
  { titulo: "Direitos do trabalhador doméstico em 2026: o que mudou", tags: ["direitos", "doméstica"] },
  { titulo: "Como pedir auxílio-desemprego em {cidade} passo a passo", tags: ["direitos", "desemprego"] },
  { titulo: "Carteira assinada vs MEI: qual vale mais a pena para autônomos", tags: ["mei", "carreira"] },
  { titulo: "Entrevista de emprego: 7 erros que fazem você ser eliminado", tags: ["entrevista", "dicas"] },
  { titulo: "Como negociar salário em vaga operacional sem perder a oportunidade", tags: ["salário", "carreira"] },
  { titulo: "Currículo simples que funciona: modelo para vaga operacional", tags: ["currículo", "dicas"] },
  { titulo: "Como achar primeiro emprego em {cidade} sem experiência", tags: ["primeiro emprego", "jovem"] },
];

const CIDADES = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre",
  "Salvador", "Brasília", "Fortaleza", "Recife", "Campinas", "Goiânia", "Manaus",
];

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

async function gerarPostComIA(titulo: string, tags: string[]) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY ausente");

  const system = `Você é redator SEO do blog VagasAgora (vagasagora.com.br), site brasileiro de empregos populares.
Escreva em português brasileiro claro, direto, para quem tem ensino fundamental ou médio.
Estrutura obrigatória do conteúdo:
- Parágrafo curto de abertura (sem H1).
- 4 a 6 seções com "## Título".
- Listas com "- " quando útil.
- **negrito** em valores, prazos e termos-chave.
- 450 a 650 palavras.
- Dados realistas de 2026 (faixas salariais, CLT, etc).
- Última seção "## Como o VagasAgora ajuda" com CTA para cadastro grátis.
NÃO inclua o título dentro do conteúdo.`;

  const userPrompt = `Crie post de blog SEO sobre: "${titulo}".
Tags base: ${JSON.stringify(tags)}.
Responda APENAS com JSON válido:
{"titulo":"...", "resumo":"frase de 140-160 chars com palavra-chave", "conteudo":"markdown completo", "tags":["3 a 5 tags"]}`;

  const res = await fetch(AI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI Gateway ${res.status}: ${t.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim() ?? "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("IA não retornou JSON");
  return JSON.parse(m[0]) as { titulo: string; resumo: string; conteudo: string; tags: string[] };
}

export const Route = createFileRoute("/api/public/cron/gerar-post")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Autenticação simples via apikey (anon key) — padrão para /api/public/* chamado pelo pg_cron
        const apikey = request.headers.get("apikey") ?? new URL(request.url).searchParams.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
        if (expected && apikey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        try {
          const { data: existentes } = await supabaseAdmin
            .from("posts")
            .select("titulo")
            .order("published_at", { ascending: false })
            .limit(80);
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
