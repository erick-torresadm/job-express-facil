import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SITE_URL } from "@/lib/site";
import { getAccessToken, publish } from "@/lib/google-indexing.functions";

// ─────────────────────────────────────────────────────────────
// Cron diário: reindexação rotativa de vagas no Google Indexing API
//
// Estratégia (baseada na experiência da comunidade Reddit/SEO):
// - Enviamos ~120 URLs/dia (bem abaixo do limite oficial de 200 pra JobPosting)
// - Rotaciona: prioriza vagas ativas NUNCA enviadas antes,
//   depois as com google_indexed_at mais antigo
// - Pausa de 200ms entre pings pra respeitar rate limit
// - Marca google_indexed_at em cada vaga enviada com sucesso
//
// Chamado por pg_cron uma vez por dia. Autentica via x-cron-secret
// (mesmo esquema usado no /api/public/cron/gerar-post).
// ─────────────────────────────────────────────────────────────

const DEFAULT_LIMITE = 120;

export const Route = createFileRoute("/api/public/cron/reindex-google")({
  server: {
    handlers: {
      POST: async ({ request }) => handle(request),
      GET: async ({ request }) => handle(request),
    },
  },
});

async function handle(request: Request) {
  // Auth via x-cron-secret (mesmo esquema das outras rotas de cron)
  const sent = request.headers.get("x-cron-secret") ?? "";
  if (!sent) return new Response("Unauthorized", { status: 401 });

  const { data: secretRow } = await supabaseAdmin
    .schema("private" as never)
    .from("app_secrets" as never)
    .select("value")
    .eq("name", "cron_secret")
    .maybeSingle<{ value: string }>();
  const expected = secretRow?.value ?? "";
  if (!expected || sent.length !== expected.length) {
    return new Response("Unauthorized", { status: 401 });
  }
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sent.charCodeAt(i);
  if (diff !== 0) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const limite = Math.min(
    Math.max(parseInt(url.searchParams.get("limite") ?? String(DEFAULT_LIMITE), 10) || DEFAULT_LIMITE, 1),
    180,
  );

  // Puxa vagas ativas priorizando: nunca enviadas > mais antigas
  const { data: vagas, error } = await supabaseAdmin
    .from("vagas")
    .select("id,titulo,cidade,profissao_slug,google_indexed_at")
    .eq("ativa", true)
    .order("google_indexed_at", { ascending: true, nullsFirst: true })
    .limit(limite);
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!vagas || vagas.length === 0) {
    return Response.json({ ok: true, total: 0, enviadas: 0, message: "Nenhuma vaga ativa." });
  }

  let token: string;
  try {
    token = await getAccessToken();
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  let ok = 0;
  let falha = 0;
  const erros: string[] = [];
  const enviadasIds: string[] = [];

  for (const v of vagas) {
    const slug = `${v.profissao_slug ?? v.titulo.toLowerCase().replace(/\s+/g, "-")}-em-${v.cidade.toLowerCase().replace(/\s+/g, "-")}`;
    const vagaUrl = `${SITE_URL}/vagas/${slug}`;
    try {
      await publish(vagaUrl, "URL_UPDATED", token);
      ok++;
      enviadasIds.push(v.id);
    } catch (e) {
      falha++;
      const msg = e instanceof Error ? e.message : String(e);
      if (erros.length < 5) erros.push(`${vagaUrl}: ${msg.slice(0, 200)}`);
      // Se der 429 (rate limit) ou 403 (quota), interrompe pra não queimar tudo
      if (msg.includes("429") || msg.includes("RATE_LIMIT") || msg.includes("quotaExceeded")) {
        erros.push("[abort] limite diário/rate atingido — parando execução.");
        break;
      }
    }
    // Pausa curta entre pings (rate limit oficial: 600/min)
    await new Promise((r) => setTimeout(r, 200));
  }

  // Atualiza google_indexed_at nas vagas enviadas com sucesso
  if (enviadasIds.length > 0) {
    await supabaseAdmin
      .from("vagas")
      .update({ google_indexed_at: new Date().toISOString() })
      .in("id", enviadasIds);
  }

  return Response.json({
    ok: true,
    total: vagas.length,
    enviadas: ok,
    falhas: falha,
    erros,
    executado_em: new Date().toISOString(),
  });
}
