import { createFileRoute } from "@tanstack/react-router";
import { getAccessToken, publish } from "@/lib/google-indexing.functions";
import { SITE_URL } from "@/lib/site";

// Cron diário: reindexa até 120 URLs/dia no Google Indexing API.
// Autenticado via header x-cron-secret == CRON_SECRET.
export const Route = createFileRoute("/api/public/cron/reindex-vagas")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = request.headers.get("x-cron-secret");
        if (!secret || secret !== process.env.CRON_SECRET) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const url = new URL(request.url);
        const limite = Math.min(
          Math.max(parseInt(url.searchParams.get("limite") ?? "120", 10) || 120, 1),
          180,
        );

        const { data: vagas, error } = await supabaseAdmin
          .from("vagas")
          .select("id,titulo,cidade,profissao_slug,google_indexed_at")
          .eq("ativa", true)
          .order("google_indexed_at", { ascending: true, nullsFirst: true })
          .limit(limite);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let token: string;
        try {
          token = await getAccessToken();
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        let ok = 0;
        let falha = 0;
        const erros: string[] = [];
        const enviadasIds: string[] = [];
        let quotaExceeded = false;

        for (const v of vagas ?? []) {
          const slug = `${v.profissao_slug ?? v.titulo.toLowerCase().replace(/\s+/g, "-")}-em-${v.cidade.toLowerCase().replace(/\s+/g, "-")}`;
          const pageUrl = `${SITE_URL}/vagas/${slug}`;
          try {
            await publish(pageUrl, "URL_UPDATED", token);
            ok++;
            enviadasIds.push(v.id);
          } catch (err) {
            falha++;
            const msg = err instanceof Error ? err.message : String(err);
            if (erros.length < 5) erros.push(`${pageUrl}: ${msg}`);
            if (msg.includes("429") || msg.includes("quotaExceeded")) {
              quotaExceeded = true;
              break;
            }
          }
          await new Promise((r) => setTimeout(r, 200));
        }

        if (enviadasIds.length > 0) {
          await supabaseAdmin
            .from("vagas")
            .update({ google_indexed_at: new Date().toISOString() })
            .in("id", enviadasIds);
        }

        return new Response(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            total: vagas?.length ?? 0,
            ok,
            falha,
            quotaExceeded,
            erros,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
