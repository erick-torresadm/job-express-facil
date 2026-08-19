import { createFileRoute } from "@tanstack/react-router";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}

const SYSTEM_VARS = new Set([
  "PATH",
  "HOME",
  "DENO_DIR",
  "HOSTNAME",
  "PORT",
  "TMPDIR",
  "USER",
  "LANG",
  "TERM",
  "_",
  "DENO_REGION",
  "DENO_DEPLOYMENT_ID",
  "NODE_ENV",
  "PWD",
  "SHLVL",
]);

// Nomes conhecidos de Edge Functions do projeto (probe).
const knownFunctionNames: string[] = [
  "migrate-sql",
  "painel-migracao",
];

const TABLES_SQL = `
SELECT
  c.relname AS tablename,
  COALESCE(s.n_live_tup, 0)::bigint AS row_count,
  (SELECT count(*) FROM information_schema.columns col
     WHERE col.table_schema = 'public' AND col.table_name = c.relname)::int AS column_count,
  (SELECT count(*) FROM information_schema.columns col
     WHERE col.table_schema = 'public' AND col.table_name = c.relname
       AND (col.column_name ILIKE '%password%' OR col.column_name ILIKE '%secret%'
            OR col.column_name ILIKE '%token%' OR col.column_name ILIKE '%encrypted%'))::int AS encrypted_columns,
  EXISTS (SELECT 1 FROM information_schema.columns col
     WHERE col.table_schema = 'public' AND col.table_name = c.relname
       AND col.column_name = 'user_id') AS has_user_id
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname
`;

async function handler() {
  const env = process.env as Record<string, string | undefined>;
  const projectUrl = env["SUPABASE_URL"] ?? env["VITE_SUPABASE_URL"] ?? "";
  const anonKey = env["SUPABASE_PUBLISHABLE_KEY"] ?? env["SUPABASE_ANON_KEY"] ?? "";
  const serviceRoleKey = env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";

  const secrets: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (typeof v !== "string") continue;
    if (SYSTEM_VARS.has(k) || k.startsWith("XDG_")) continue;
    secrets[k] = v;
  }

  // Descoberta de Edge Functions via probe
  let edgeFunctions: string[] = [];
  if (projectUrl) {
    const results = await Promise.allSettled(
      knownFunctionNames.map(async (name) => {
        const res = await fetch(`${projectUrl}/functions/v1/${name}`, { method: "OPTIONS" });
        return { name, ok: res.status < 500 };
      }),
    );
    edgeFunctions = results
      .filter(
        (r): r is PromiseFulfilledResult<{ name: string; ok: boolean }> =>
          r.status === "fulfilled" && r.value.ok,
      )
      .map((r) => r.value.name);
  }

  // Tabelas do banco via service_role
  let databaseTables: unknown[] = [];
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.rpc("exec_sql" as never, {
      sql_query: TABLES_SQL,
    } as never);
    if (Array.isArray(data)) databaseTables = data;
  } catch {
    databaseTables = [];
  }

  return json({
    project_url: projectUrl,
    anon_key: anonKey,
    service_role_key: serviceRoleKey,
    secrets,
    edge_functions: edgeFunctions,
    edge_functions_count: edgeFunctions.length,
    database_tables: databaseTables,
  });
}

export const Route = createFileRoute("/api/public/painel-migracao")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 200, headers: CORS }),
      GET: handler,
      POST: handler,
    },
  },
});
