import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldAlert,
  Key,
  Download,
  Loader2,
  Code2,
  Database,
  AlertTriangle,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/painel-migracao")({
  head: () => ({
    meta: [
      { title: "Painel de Migração — VagasAgora" },
      {
        name: "description",
        content:
          "Painel temporário para coletar credenciais, secrets, edge functions e tabelas na ordem certa da migração.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel de Migração — VagasAgora" },
      {
        property: "og:description",
        content: "Coleta ordenada de credenciais e recursos para migrar o projeto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PainelMigracao,
});

type TabelaInfo = {
  tablename: string;
  row_count: number;
  column_count: number;
  encrypted_columns: number;
  has_user_id: boolean;
};

type PainelData = {
  project_url: string;
  anon_key: string;
  service_role_key: string;
  secrets: Record<string, string>;
  edge_functions: string[];
  edge_functions_count: number;
  database_tables: TabelaInfo[];
};

const CORE_KEYS = new Set([
  "SUPABASE_URL",
  "VITE_SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_PROJECT_ID",
  "VITE_SUPABASE_PROJECT_ID",
]);

function mask(value: string) {
  if (!value) return "—";
  if (value.length <= 24) return `${value.slice(0, 4)}•••••`;
  return `${value.slice(0, 12)}•••••${value.slice(-8)}`;
}

function classificar(t: TabelaInfo): "Essencial" | "Histórico" | "Ignorar" {
  const n = t.tablename.toLowerCase();
  if (/(log|view|event|track|analytics|audit)/.test(n)) return "Ignorar";
  if (/(notificac|historic|candidatur|orcamento|post)/.test(n)) return "Histórico";
  return "Essencial";
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copiar ${label}`}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setDone(true);
        toast.success(`${label} copiado`);
        setTimeout(() => setDone(false), 1500);
      }}
      className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function SecretRow({ label, value }: { label: string; value: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-mono text-sm text-foreground">
          {show ? value || "—" : mask(value)}
        </p>
      </div>
      <button
        type="button"
        aria-label={show ? `Ocultar ${label}` : `Mostrar ${label}`}
        onClick={() => setShow((s) => !s)}
        className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      <CopyBtn value={value} label={label} />
    </div>
  );
}

function StepCard({
  n,
  title,
  icon,
  children,
}: {
  n: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {n}
        </span>
        <div className="flex items-center gap-2 text-foreground">
          {icon}
          <h2 className="text-lg font-semibold">
            Passo {n} — {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function PainelMigracao() {
  const [data, setData] = useState<PainelData | null>(null);
  const [loading, setLoading] = useState(false);

  async function revelarTudo() {
    setLoading(true);
    try {
      const res = await fetch("/api/public/painel-migracao", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as PainelData;
      setData(json);
      toast.success("Dados carregados");
    } catch (e) {
      toast.error(`Falha ao carregar: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  const extras = data
    ? Object.entries(data.secrets).filter(([k]) => !CORE_KEYS.has(k))
    : [];

  function copiarTudo() {
    if (!data) return;
    const linhas = [
      "═══════════ CREDENCIAIS ═══════════",
      `PROJECT_URL=${data.project_url}`,
      `ANON_KEY=${data.anon_key}`,
      `SERVICE_ROLE_KEY=${data.service_role_key}`,
      "",
      "═══════════ EDGE FUNCTIONS ═══════════",
      data.edge_functions.join(", ") || "(nenhuma)",
      "",
      "═══════════ SECRETS ═══════════",
      ...extras.map(([k, v]) => `${k}=${v}`),
      "",
      "═══════════ TABELAS ═══════════",
      ...data.database_tables.map(
        (t) => `${t.tablename} — ${t.row_count} linhas — ${classificar(t)}`,
      ),
    ];
    void navigator.clipboard.writeText(linhas.join("\n"));
    toast.success("Tudo copiado");
  }

  function baixarEdgeFunctions() {
    const mods = import.meta.glob("/supabase/functions/*/index.ts", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>;
    const entries = Object.entries(mods);
    if (entries.length === 0) {
      toast.info("Nenhum código de edge function embutido no build");
      return;
    }
    const out = entries
      .map(([path, code]) => {
        const name = path.split("/").slice(-2)[0];
        return `// ═══ ${name?.toUpperCase()} ═══\n${code}`;
      })
      .join("\n\n");
    download("edge-functions.ts", out);
    toast.success(`${entries.length} função(ões) baixada(s)`);
  }

  function baixarSecrets() {
    if (!data) return;
    const body = Object.entries(data.secrets)
      .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
      .join("\n");
    download(
      "secrets.ts",
      `export const SECRETS = {\n${body}\n} as const;\n\nexport type SecretKey = keyof typeof SECRETS;\n`,
    );
    toast.success("secrets.ts baixado");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Painel de Migração
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Copie os itens abaixo na ordem e cole na extensão CloneSupa.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={revelarTudo}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldAlert className="h-5 w-5" />}
          Revelar Tudo
        </button>
        <button
          type="button"
          onClick={copiarTudo}
          disabled={!data}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
          Copiar Tudo
        </button>
      </div>

      <div className="space-y-6">
        <StepCard n={1} title="Credenciais" icon={<ShieldAlert className="h-5 w-5" />}>
          <div className="space-y-2">
            <SecretRow label="Project URL" value={data?.project_url ?? ""} />
            <SecretRow label="Anon Key" value={data?.anon_key ?? ""} />
            <SecretRow label="Service Role Key" value={data?.service_role_key ?? ""} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!data}
              onClick={() => {
                void navigator.clipboard.writeText(data?.project_url ?? "");
                toast.success("Project URL copiado");
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Copiar Project URL
            </button>
            <button
              type="button"
              disabled={!data}
              onClick={() => {
                void navigator.clipboard.writeText(data?.service_role_key ?? "");
                toast.success("Service Role Key copiada");
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Copiar Service Role Key
            </button>
          </div>
        </StepCard>

        <StepCard n={2} title="Edge Functions" icon={<Code2 className="h-5 w-5" />}>
          <div className="flex flex-wrap gap-2">
            {data?.edge_functions.length ? (
              data.edge_functions.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs text-foreground"
                >
                  {f}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {data ? "Nenhuma função detectada." : "Clique em Revelar Tudo."}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={baixarEdgeFunctions}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Baixar edge-functions.ts
          </button>
        </StepCard>

        <StepCard n={3} title="Secrets" icon={<Key className="h-5 w-5" />}>
          <div className="space-y-2">
            {extras.length ? (
              extras.map(([k, v]) => <SecretRow key={k} label={k} value={v} />)
            ) : (
              <p className="text-sm text-muted-foreground">
                {data ? "Nenhum secret extra." : "Clique em Revelar Tudo."}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={baixarSecrets}
            disabled={!data}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Baixar secrets.ts
          </button>
        </StepCard>

        <StepCard n={4} title="Conferência" icon={<Database className="h-5 w-5" />}>
          <div className="rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Tabelas do Banco</p>
              <span className="text-sm text-muted-foreground">
                {data?.database_tables.length ?? 0} tabelas
              </span>
            </div>
            <ul className="divide-y divide-border">
              {(data?.database_tables ?? []).map((t) => {
                const cls = classificar(t);
                return (
                  <li key={t.tablename} className="flex items-center justify-between px-4 py-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm text-foreground">{t.tablename}</p>
                      <p className="text-xs text-muted-foreground">
                        ~{t.row_count} linhas · {t.column_count} colunas
                        {t.has_user_id ? " · user_id" : ""}
                        {t.encrypted_columns ? ` · ${t.encrypted_columns} sensíveis` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {cls}
                    </span>
                  </li>
                );
              })}
              {!data && (
                <li className="px-4 py-3 text-sm text-muted-foreground">
                  Clique em Revelar Tudo.
                </li>
              )}
            </ul>
          </div>

          <div className="mt-4 flex gap-3 rounded-xl border border-border bg-muted/40 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              As senhas são copiadas como <strong>hash bcrypt</strong>. Se o JWT secret do
              destino for diferente, as sessões antigas caem (usuários precisam entrar de
              novo), mas a senha continua válida.
            </p>
          </div>
          <div className="mt-3 flex gap-3 rounded-xl border border-border bg-muted/40 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Página temporária de migração. Apague esta rota depois de concluir.
            </p>
          </div>
        </StepCard>
      </div>
    </main>
  );
}
