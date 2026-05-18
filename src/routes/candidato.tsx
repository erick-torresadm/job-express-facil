import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Heart, Bell, Send, Clock, Eye, Sparkles, CheckCircle2, ArrowLeft,
  Trash2, Loader2, FileText, ExternalLink, User as UserIcon, Power, PowerOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/candidato")({
  head: () => ({ meta: [{ title: "Minha área — VagasAgora" }, { name: "robots", content: "noindex" }] }),
  component: CandidatoPage,
});

type Tab = "candidaturas" | "favoritos" | "alertas" | "curriculo";

function slugCidade(cidade?: string | null) {
  return (cidade ?? "sao-paulo").toLowerCase().replace(/\s+/g, "-");
}

function CandidatoPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("candidaturas");
  const [counts, setCounts] = useState({ candidaturas: 0, favoritos: 0, alertas: 0 });
  const [perfil, setPerfil] = useState<{ full_name: string | null; avatar_url: string | null; handle: string | null } | null>(null);
  const [cvSlug, setCvSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const loadHeader = useCallback(async () => {
    if (!user) return;
    const [{ data: prof }, { data: cv }, { count: cCount }, { count: fCount }, { count: aCount }] = await Promise.all([
      supabase.from("profiles").select("full_name,avatar_url,handle").eq("id", user.id).maybeSingle(),
      supabase.from("curriculos").select("slug").eq("user_id", user.id).limit(1).maybeSingle(),
      supabase.from("candidaturas").select("id", { count: "exact", head: true }).eq("candidato_id", user.id),
      supabase.from("favoritos").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("alertas").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    setPerfil(prof ?? null);
    setCvSlug(cv?.slug ?? null);
    setCounts({ candidaturas: cCount ?? 0, favoritos: fCount ?? 0, alertas: aCount ?? 0 });
  }, [user]);

  useEffect(() => { loadHeader(); }, [loadHeader]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!user) return null;

  const nome = perfil?.full_name || user.email?.split("@")[0] || "Candidato";
  const inicial = nome.slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-secondary">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <p className="text-sm font-bold">Minha área</p>
          <Link to="/perfil" className="text-xs font-semibold text-primary">Editar perfil</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        {/* Cabeçalho com identidade */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent text-lg font-extrabold text-primary-foreground">
            {perfil?.avatar_url ? <img src={perfil.avatar_url} alt={nome} className="h-full w-full object-cover" /> : inicial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold leading-tight">Olá, {nome.split(" ")[0]} 👋</p>
            {cvSlug ? (
              <Link to="/cv/$slug" params={{ slug: cvSlug }} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Ver meu CV público <ExternalLink className="h-3 w-3" />
              </Link>
            ) : (
              <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                Criar meu currículo <Sparkles className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatCard label="Candidaturas" value={counts.candidaturas} icon={<Send className="h-4 w-4" />} />
          <StatCard label="Salvas" value={counts.favoritos} icon={<Heart className="h-4 w-4" />} />
          <StatCard label="Alertas" value={counts.alertas} icon={<Bell className="h-4 w-4" />} />
        </div>

        {/* Tabs */}
        <div className="mt-5 grid grid-cols-4 gap-1.5 rounded-2xl bg-card p-1.5">
          <TabBtn active={tab === "candidaturas"} onClick={() => setTab("candidaturas")} icon={<Send className="h-4 w-4" />} label="Vagas" />
          <TabBtn active={tab === "favoritos"} onClick={() => setTab("favoritos")} icon={<Heart className="h-4 w-4" />} label="Salvas" />
          <TabBtn active={tab === "alertas"} onClick={() => setTab("alertas")} icon={<Bell className="h-4 w-4" />} label="Alertas" />
          <TabBtn active={tab === "curriculo"} onClick={() => setTab("curriculo")} icon={<FileText className="h-4 w-4" />} label="CV" />
        </div>

        <div className="mt-5">
          {tab === "candidaturas" && <Candidaturas userId={user.id} onChange={loadHeader} />}
          {tab === "favoritos" && <Favoritos userId={user.id} onChange={loadHeader} />}
          {tab === "alertas" && <Alertas userId={user.id} onChange={loadHeader} />}
          {tab === "curriculo" && <Curriculo cvSlug={cvSlug} />}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-soft">
      <div className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-secondary text-foreground">{icon}</div>
      <p className="mt-1 text-xl font-extrabold leading-none">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition sm:text-sm ${
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

function Candidaturas({ userId, onChange }: { userId: string; onChange: () => void }) {
  const [items, setItems] = useState<Candidatura[] | null>(null);

  const load = useCallback(() => {
    supabase.from("candidaturas")
      .select("id,status,created_at,respostas,vagas(titulo,empresa_nome,bairro,cidade,salario,profissao_slug)")
      .eq("candidato_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as unknown as Candidatura[]));
  }, [userId]);

  useEffect(() => {
    load();
    // realtime: status mudou? recarrega
    const ch = supabase
      .channel(`candidaturas:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "candidaturas", filter: `candidato_id=eq.${userId}` },
        () => { load(); onChange(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, load, onChange]);

  if (items === null) return <Loader />;
  if (items.length === 0) return <Empty icon={<Send />} title="Nenhuma candidatura ainda" desc="Encontre vagas perto de você e candidate-se em 1 clique." cta="Ver vagas" to="/" />;

  return (
    <ul className="space-y-3">
      {items.map((c) => {
        const slug = c.vagas?.profissao_slug ? `${c.vagas.profissao_slug}-em-${slugCidade(c.vagas.cidade)}` : null;
        return (
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
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[10px] uppercase text-muted-foreground">
                Enviada em {new Date(c.created_at).toLocaleDateString("pt-BR")}
              </p>
              {slug && (
                <Link to="/vagas/$slug" params={{ slug }}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground">
                  Ver vaga <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </li>
        );
      })}
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
  created_at: string;
  vagas: { titulo: string; empresa_nome: string; salario: string; bairro: string; cidade: string; profissao_slug: string; ativa: boolean } | null;
};

function Favoritos({ userId, onChange }: { userId: string; onChange: () => void }) {
  const [items, setItems] = useState<Favorito[] | null>(null);

  useEffect(() => {
    supabase.from("favoritos")
      .select("id,vaga_id,created_at,vagas(titulo,empresa_nome,salario,bairro,cidade,profissao_slug,ativa)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as unknown as Favorito[]));
  }, [userId]);

  const remover = async (id: string) => {
    const { error } = await supabase.from("favoritos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev?.filter((f) => f.id !== id) ?? null);
    onChange();
    toast.success("Removido das salvas");
  };

  if (items === null) return <Loader />;
  if (items.length === 0) return <Empty icon={<Heart />} title="Sem vagas salvas" desc="Toque no coração nas vagas para guardar e voltar depois." cta="Procurar vagas" to="/" />;

  return (
    <ul className="space-y-3">
      {items.map((f) => {
        const slug = f.vagas?.profissao_slug ? `${f.vagas.profissao_slug}-em-${slugCidade(f.vagas.cidade)}` : null;
        const encerrada = f.vagas && !f.vagas.ativa;
        return (
          <li key={f.id} className={`flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 ${encerrada ? "opacity-60" : ""}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-bold leading-tight">{f.vagas?.titulo}</h3>
                {encerrada && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">Encerrada</span>}
              </div>
              <p className="truncate text-xs text-muted-foreground">{f.vagas?.empresa_nome} • {f.vagas?.bairro}, {f.vagas?.cidade}</p>
              <p className="text-xs font-semibold">{f.vagas?.salario}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {slug && !encerrada && (
                <Link to="/vagas/$slug" params={{ slug }}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Ver</Link>
              )}
              <button onClick={() => remover(f.id)} aria-label="Remover" className="grid h-9 w-9 place-items-center rounded-lg border border-border text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

type Alerta = { id: string; profissao: string | null; cidade: string | null; bairro: string | null; ativo: boolean };

function Alertas({ userId, onChange }: { userId: string; onChange: () => void }) {
  const [items, setItems] = useState<Alerta[] | null>(null);
  const [novo, setNovo] = useState({ profissao: "", cidade: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    supabase.from("alertas").select("*").eq("user_id", userId).order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as Alerta[]));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const criar = async () => {
    if (!novo.profissao && !novo.cidade) return toast.info("Informe pelo menos a profissão ou cidade");
    setSaving(true);
    const { error } = await supabase.from("alertas").insert({ user_id: userId, profissao: novo.profissao || null, cidade: novo.cidade || null, ativo: true });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Alerta criado");
    setNovo({ profissao: "", cidade: "" });
    load(); onChange();
  };

  const toggle = async (a: Alerta) => {
    const { error } = await supabase.from("alertas").update({ ativo: !a.ativo }).eq("id", a.id);
    if (error) return toast.error(error.message);
    setItems((p) => p?.map((x) => x.id === a.id ? { ...x, ativo: !a.ativo } : x) ?? null);
  };

  const remover = async (id: string) => {
    const { error } = await supabase.from("alertas").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((p) => p?.filter((a) => a.id !== id) ?? null);
    onChange();
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
        <Empty icon={<Bell />} title="Nenhum alerta ativo" desc="Crie alertas para ser avisado antes da concorrência." />
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id} className={`flex items-center justify-between rounded-2xl border border-border bg-card p-3 ${!a.ativo ? "opacity-60" : ""}`}>
              <div>
                <p className="text-sm font-bold">{a.profissao ?? "Qualquer profissão"}</p>
                <p className="text-xs text-muted-foreground">em {a.cidade ?? "qualquer cidade"}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggle(a)} aria-label={a.ativo ? "Pausar" : "Ativar"}
                  className={`grid h-9 w-9 place-items-center rounded-lg border border-border ${a.ativo ? "text-accent" : "text-muted-foreground"}`}>
                  {a.ativo ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                </button>
                <button onClick={() => remover(a.id)} aria-label="Remover" className="grid h-9 w-9 place-items-center rounded-lg border border-border text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Curriculo({ cvSlug }: { cvSlug: string | null }) {
  if (!cvSlug) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <FileText className="h-6 w-6" />
        </div>
        <p className="text-base font-extrabold">Você ainda não tem currículo</p>
        <p className="mt-1 text-sm text-muted-foreground">Crie em menos de 2 minutos com nossa IA — apenas falando.</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground">
          <Sparkles className="h-4 w-4" /> Criar meu CV agora
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent"><FileText className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold">Seu currículo está publicado</p>
            <p className="truncate text-xs text-muted-foreground">vagasagora.com.br/cv/{cvSlug}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link to="/cv/$slug" params={{ slug: cvSlug }}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground">
            <ExternalLink className="h-4 w-4" /> Ver público
          </Link>
          <Link to="/perfil"
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-bold text-foreground">
            <UserIcon className="h-4 w-4" /> Editar perfil
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-bold">💡 Aumente suas chances</p>
        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          <li>• Adicione foto no perfil — vagas com foto têm 3x mais retorno</li>
          <li>• Cadastre alertas para vagas perto de você</li>
          <li>• Conecte seu LinkedIn no currículo público</li>
        </ul>
      </div>
    </div>
  );
}

function Loader() { return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>; }
function Empty({ icon, title, desc, cta, to }: { icon: React.ReactNode; title: string; desc?: string; cta?: string; to?: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
      <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">{icon}</div>
      <p className="text-sm font-bold">{title}</p>
      {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
      {cta && <Link to={to ?? "/"} className="mt-3 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground">{cta}</Link>}
    </div>
  );
}
