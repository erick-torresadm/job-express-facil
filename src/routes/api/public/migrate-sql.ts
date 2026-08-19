import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/migrate-sql")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 200, headers: CORS }),
      POST: async ({ request }) => {
        let body: { key?: string; sql_query?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return json({ error: "bad json" }, 400);
        }
        if (!body.key || !body.sql_query) {
          return json({ error: "key e sql_query são obrigatórios" }, 400);
        }

        const url = process.env["SUPABASE_URL"];
        if (!url) return json({ error: "SUPABASE_URL ausente" }, 400);

        const key = body.key;
        const supabase = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
                h.delete("Authorization");
              }
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });

        // exec_sql exige role service_role — chave inválida é rejeitada por ela.
        const { data, error } = await supabase.rpc("exec_sql" as never, {
          sql_query: body.sql_query,
        } as never);

        if (error) return json({ error: error.message }, 400);
        return json(data ?? []);
      },
    },
  },
});
