import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Bell, Send, Clock, Eye, Sparkles, CheckCircle2, ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/candidato")({
  head: () => ({ meta: [{ title: "Minha área — VagasAgora" }, { name: "robots", content: "noindex" }] }),
  component: CandidatoPage,
});

type Tab = "candidaturas" | "favoritos" | "alertas";

function CandidatoPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("candidaturas");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <p className="text-sm font-bold">Minha área</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-card p-1.5">
          <TabBtn active={tab === "candidaturas"} onClick={() => setTab("candidaturas")} icon={<Send className="h-4 w-4" />} label="Candidaturas" />
          <TabBtn active={tab === "favoritos"} onClick={() => setTab("favoritos")} icon={<Heart className="h-4 w-4" />} label="Salvas" />
          <TabBtn active={tab === "alertas"} onClick={() => setTab("alertas")} icon={<Bell className="h-4 w-4" />} label="Alertas" />
        </div>

        <div className="mt-5">
          {tab === "candidaturas" && <Candidaturas userId={user.id} />}
          {tab === "favoritos" && <Favoritos userId={user.id} />}
          {tab === "alertas" && <Alertas userId={user.id} />}
        </div>
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
        active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-secondary"
      }`}>
      {icon} {label}
    </button>
  );
}

type Candidatura = {
  id: string;
  status: "enviado" | "visto" | "em_analise" | "finalizado";
  created_at: string;
  respostas: unknown;
  vagas: { titulo: string; empresa_nome: string; bairro: string; cidade: string; salario: string; profissao_slug: string } | null;
};

function Candidaturas({ userId }: { userId: string }) {
  const [items, setItems] = useState<Candidatura[] | null>(null);

  useEffect(() => {
    supabase.from("candidaturas")
      .select("id,status,created_at,respostas,vagas(titulo,empresa_nome,bairro,cidade,salario,profissao_slug)")
      .eq("candidato_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as unknown as Candidatura[]));
  }, [userId]);

  if (items === null) return <Loader />;
  if (items.length === 0) return <Empty icon={<Send />} title="Nenhuma candidatura ainda" cta="Ver vagas" />;

  return (
    <ul className="space-y-3">
      {items.map((c) => (
        <li key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-extrabold leading-tight">{c.vagas?.titulo ?? "Vaga"}</h3>
              <p className="text-xs text-muted-foreground">{c.vagas?.empresa_nome} • {c.vagas?.bairro}, {c.vagas?.cidade}</p>
              <p className="mt-1 text-xs font-semibold text-foreground">{c.vagas?.salario}</p>
            </div>
            <StatusPill status={c.status} />
          </div>
          <PipelineBar status={c.status} />
          <p className="mt-2 text-[10px] uppercase text-muted-foreground">
            Enviada em {new Date(c.created_at).toLocaleDateString("pt-BR")}
          </p>
        </li>
      ))}
    </ul>
  );
}

const STATUS_LABEL = {
  enviado: "Enviada",
  visto: "Visualizada",
  em_analise: "Em análise",
  finalizado: "Finalizada",
} as const;
const STATUS_ICON = { enviado: Clock, visto: Eye, em_analise: Sparkles, finalizado: CheckCircle2 } as const;

function StatusPill({ status }: { status: Candidatura["status"] }) {
  const Icon = STATUS_ICON[status];
  const tone = status === "finalizado" ? "bg-accent/15 text-accent" : status === "em_analise" ? "bg-warning/15 text-warning" : status === "visto" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground";
  return (
    <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>
      <Icon className="h-3 w-3" /> {STATUS_LABEL[status]}
    </span>
  );
}

function PipelineBar({ status }: { status: Candidatura["status"] }) {
  const order = ["enviado", "visto", "em_analise", "finalizado"] as const;
  const idx = order.indexOf(status);
  return (
    <div className="mt-3 flex gap-1">
      {order.map((s, i) => (
        <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-accent" : "bg-muted"}`} />
      ))}
    </div>
  );
}

type Favorito = {
  id: string;
  vaga_id: string;
  vagas: { titulo: string; empresa_nome: string; salario: string; bairro: string; cidade: string; profissao_slug: string } | null;
};

function Favoritos({ userId }: { userId: string }) {
  const [items, setItems] = useState<Favorito[] | null>(null);

  useEffect(() => {
    supabase.from("favoritos")
      .select("id,vaga_id,vagas(titulo,empresa_nome,salario,bairro,cidade,profissao_slug)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as unknown as Favorito[]));
  }, [userId]);

  const remover = async (id: string) => {
    await supabase.from("favoritos").delete().eq("id", id);
    setItems((prev) => prev?.filter((f) => f.id !== id) ?? null);
  };

  if (items === null) return <Loader />;
  if (items.length === 0) return <Empty icon={<Heart />} title="Sem vagas salvas" cta="Procurar vagas" />;

  return (
    <ul className="space-y-3">
      {items.map((f) => (
        <li key={f.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="min-w-0">
            <h3 className="font-bold leading-tight">{f.vagas?.titulo}</h3>
            <p className="text-xs text-muted-foreground truncate">{f.vagas?.empresa_nome} • {f.vagas?.bairro}, {f.vagas?.cidade}</p>
            <p className="text-xs font-semibold">{f.vagas?.salario}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {f.vagas?.profissao_slug && (
              <Link to="/vagas/$slug" params={{ slug: `${f.vagas.profissao_slug}-em-${(f.vagas.cidade ?? "").toLowerCase().replace(/\s+/g, "-")}` }}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Ver</Link>
            )}
            <button onClick={() => remover(f.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

type Alerta = { id: string; profissao: string | null; cidade: string | null; bairro: string | null; ativo: boolean };

function Alertas({ userId }: { userId: string }) {
  const [items, setItems] = useState<Alerta[] | null>(null);
  const [novo, setNovo] = useState({ profissao: "", cidade: "" });
  const [saving, setSaving] = useState(false);

  const load = () => supabase.from("alertas").select("*").eq("user_id", userId).order("created_at", { ascending: false })
    .then(({ data }) => setItems((data ?? []) as Alerta[]));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const criar = async () => {
    if (!novo.profissao && !novo.cidade) return toast.info("Informe pelo menos a profissão");
    setSaving(true);
    const { error } = await supabase.from("alertas").insert({ user_id: userId, profissao: novo.profissao || null, cidade: novo.cidade || null, ativo: true });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Alerta criado");
    setNovo({ profissao: "", cidade: "" });
    load();
  };

  const remover = async (id: string) => {
    await supabase.from("alertas").delete().eq("id", id);
    setItems((p) => p?.filter((a) => a.id !== id) ?? null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-4">
        <p className="text-sm font-bold">🔔 Criar alerta</p>
        <p className="text-xs text-muted-foreground">Receba notificação assim que entrar vaga compatível.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input value={novo.profissao} onChange={(e) => setNovo((n) => ({ ...n, profissao: e.target.value }))}
            placeholder="Profissão (ex: motorista)"
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm" />
          <input value={novo.cidade} onChange={(e) => setNovo((n) => ({ ...n, cidade: e.target.value }))}
            placeholder="Cidade (ex: São Paulo)"
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm" />
        </div>
        <button onClick={criar} disabled={saving} className="mt-3 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground disabled:opacity-50">
          {saving ? "Salvando..." : "Criar alerta"}
        </button>
      </div>

      {items === null ? <Loader /> : items.length === 0 ? (
        <Empty icon={<Bell />} title="Nenhum alerta ativo" />
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3">
              <div>
                <p className="text-sm font-bold">{a.profissao ?? "Qualquer profissão"}</p>
                <p className="text-xs text-muted-foreground">em {a.cidade ?? "qualquer cidade"}</p>
              </div>
              <button onClick={() => remover(a.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Loader() { return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>; }
function Empty({ icon, title, cta }: { icon: React.ReactNode; title: string; cta?: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
      <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">{icon}</div>
      <p className="text-sm font-bold">{title}</p>
      {cta && <Link to="/" className="mt-3 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground">{cta}</Link>}
    </div>
  );
}
