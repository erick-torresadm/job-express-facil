import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Users, PlusSquare, BarChart3, Briefcase, Globe, ShieldCheck, TrendingUp, ShieldAlert, Link2, Gift, Bell, Mail, Activity } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/hooks/use-auth";
import { getRevelacoesInfo, getEmpresaDashboard } from "@/lib/empresa.functions";
import { countUnreadEvents } from "@/lib/recruiter-notifications.server";
import { toggleDigestOptOut } from "@/lib/promo.functions";
import { CandidatosList } from "@/components/CandidatosList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";




export const Route = createFileRoute("/empresa")({
  head: () => ({
    meta: [
      { title: "Painel do Recrutador — VagasAgora" },
      { name: "description", content: "Encontre candidatos qualificados no seu bairro." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EmpresaLayout,
});

function EmpresaLayout() {
  const loc = useLocation();
  const isRoot = loc.pathname === "/empresa" || loc.pathname === "/empresa/";
  return (
    <div className="min-h-screen bg-secondary">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-primary text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-extrabold">VagasAgora</p>
            <p className="text-xs opacity-70">Painel RH</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <NavItem to="/empresa" icon={<Users className="h-4 w-4" />} label="Candidatos" exact />
          <NavItem to="/empresa/atividade" icon={<Activity className="h-4 w-4" />} label="Atividade" badge />
          <NavItem to="/empresa/nova-vaga" icon={<PlusSquare className="h-4 w-4" />} label="Nova vaga" />
          <NavItem to="/empresa/minhas-vagas" icon={<Briefcase className="h-4 w-4" />} label="Minhas vagas" />
          <NavItem to="/empresa/pagina" icon={<Globe className="h-4 w-4" />} label="Minha página" />
          <NavItem to="/empresa/verificacao" icon={<ShieldCheck className="h-4 w-4" />} label="Verificação" />
          <NavItem to="/empresa" icon={<BarChart3 className="h-4 w-4" />} label="Métricas" disabled />
        </nav>
        <CreditoCard />
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 lg:px-8">
          <EmpresaSaudacao />
          <NotificationBell />
        </header>
        <main className="p-4 lg:p-8">
          {isRoot && (
            <>
              <ProAtivoBadge />
              <DashboardKPIs />
              <DigestToggle />
            </>
          )}
          {isRoot ? <CandidatosList /> : <Outlet />}
        </main>

      </div>
    </div>
  );
}

function ProAtivoBadge() {
  const { user } = useAuth();
  const [ate, setAte] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("promo_pro_ate").eq("id", user.id).maybeSingle()
      .then(({ data }) => setAte((data as { promo_pro_ate?: string | null } | null)?.promo_pro_ate ?? null));
  }, [user]);
  if (!ate || new Date(ate).getTime() <= Date.now()) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-accent/40 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 p-4">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase text-accent-foreground">
        <Gift className="h-3 w-3" /> Pro ativo
      </span>
      <p className="text-sm">
        <strong>Plano Full grátis até {new Date(ate).toLocaleDateString("pt-BR")}</strong> — todos os contatos liberados, IA de match, anti-fraude e prioridade no suporte.
      </p>
    </div>
  );
}

function DigestToggle() {
  const { user } = useAuth();
  const [optOut, setOptOut] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const salvar = useServerFn(toggleDigestOptOut);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("digest_opt_out").eq("id", user.id).maybeSingle()
      .then(({ data }) => setOptOut(!!(data as { digest_opt_out?: boolean } | null)?.digest_opt_out));
  }, [user]);
  if (optOut === null) return null;
  const receber = !optOut;
  const alternar = async () => {
    setSaving(true);
    try {
      await salvar({ data: { opt_out: receber } });
      setOptOut(receber);
      toast.success(receber ? "Você deixou de receber o resumo diário" : "Resumo diário ativado — chega todo dia 09h");
    } catch {
      toast.error("Não deu pra salvar. Tenta de novo.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Mail className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold">Resumo diário por email + push</p>
          <p className="text-xs text-muted-foreground">
            Todo dia às 9h você recebe: novos candidatos que bateram com suas vagas, top currículos e dicas.
          </p>
        </div>
      </div>
      <button
        onClick={alternar}
        disabled={saving}
        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition disabled:opacity-60 ${
          receber ? "bg-secondary text-foreground hover:bg-secondary/70" : "bg-accent text-accent-foreground shadow-pop"
        }`}
      >
        <Bell className="h-3.5 w-3.5" /> {receber ? "Desativar resumo" : "Ativar resumo diário"}
      </button>
    </div>
  );
}


function NavItem({ to, icon, label, exact, disabled, badge }: { to: string; icon: React.ReactNode; label: string; exact?: boolean; disabled?: boolean; badge?: boolean }) {
  if (disabled) {
    return (
      <span className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm opacity-40">
        <span className="flex items-center gap-2">{icon} {label}</span>
      </span>
    );
  }
  return (
    <Link to={to} activeOptions={{ exact }}
      activeProps={{ className: "bg-accent text-accent-foreground" }}
      className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-primary-foreground/10">
      <span className="flex items-center gap-2">{icon} {label}</span>
      {badge && <ActivityBadge />}
    </Link>
  );
}

function ActivityBadge() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const fetchUnread = useServerFn(countUnreadEvents);

  useEffect(() => {
    if (!user) return;
    fetchUnread()
      .then((r) => setUnread(r.unread))
      .catch(() => setUnread(0));

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`recruiter_events:empresa_id=eq.${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recruiter_events",
          filter: `empresa_id=eq.${user.id}`,
        },
        () => {
          // Refresh unread count
          fetchUnread()
            .then((r) => setUnread(r.unread))
            .catch(() => setUnread(0));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchUnread]);

  if (unread === 0) return null;
  return (
    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
      {unread > 9 ? "9+" : unread}
    </span>
  );
}

function EmpresaSaudacao() {
  const { user } = useAuth();
  const nome = user?.user_metadata?.company_name || user?.user_metadata?.full_name || user?.email || "sua conta";
  return <p className="text-sm text-muted-foreground">Olá, <strong className="text-foreground">{nome}</strong></p>;
}

function CreditoCard() {
  const { user } = useAuth();
  const fetchInfo = useServerFn(getRevelacoesInfo);
  const [info, setInfo] = useState<{ usadas: number; limite: number; restantes: number } | null>(null);
  useEffect(() => {
    if (!user) return;
    fetchInfo().then(setInfo).catch(() => setInfo(null));
  }, [user, fetchInfo]);
  if (!info) return null;
  const acabou = info.restantes === 0;
  return (
    <Link to="/planos" className="m-3 block rounded-2xl bg-accent/15 p-4 text-xs hover:bg-accent/25">
      <p className="font-bold">{acabou ? "Contatos esgotados" : "Contatos grátis"}</p>
      <p className="opacity-70">{info.restantes} de {info.limite} restantes</p>
      <p className="mt-2 font-extrabold text-accent">{acabou ? "Ver planos →" : "Upgrade para mais"}</p>
    </Link>
  );
}

function DashboardKPIs() {
  const { user } = useAuth();
  const fetchDash = useServerFn(getEmpresaDashboard);
  const [d, setD] = useState<Awaited<ReturnType<typeof getEmpresaDashboard>> | null>(null);
  useEffect(() => {
    if (!user) return;
    fetchDash().then(setD).catch(() => setD(null));
  }, [user, fetchDash]);
  if (!d) return null;

  return (
    <div className="mb-6 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Briefcase className="h-4 w-4" />} label="Vagas ativas" value={d.vagas_ativas} hint={`${d.vagas_totais} no total`} />
        <Kpi icon={<Users className="h-4 w-4" />} label="Candidaturas" value={d.candidaturas_totais} hint={`+${d.candidaturas_7d} em 7 dias`} tone="accent" />
        <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Contatos restantes" value={d.contatos_restantes} hint={`${d.contatos_usados}/${d.contatos_limite} usados`} tone={d.contatos_restantes === 0 ? "warning" : "default"} />
        <Kpi icon={<ShieldCheck className="h-4 w-4" />} label="Verificação" value={d.verificada ? "Aprovada" : "Pendente"} hint={d.verificada ? "Selo ativo" : "Aumenta candidatos"} tone={d.verificada ? "accent" : "warning"} />
      </div>
      {(!d.tem_pagina || !d.verificada) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Para atrair mais candidatos:</span>
          {!d.tem_pagina && (
            <Link to="/empresa/pagina" className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 font-bold text-primary-foreground">
              <Link2 className="h-3 w-3" /> Criar página de captação
            </Link>
          )}
          {!d.verificada && (
            <Link to="/empresa/verificacao" className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 font-bold text-accent-foreground">
              <ShieldCheck className="h-3 w-3" /> Verificar empresa
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Kpi({ icon, label, value, hint, tone = "default" }: { icon: React.ReactNode; label: string; value: string | number; hint?: string; tone?: "default" | "accent" | "warning" }) {
  const toneCls = tone === "accent" ? "text-accent" : tone === "warning" ? "text-warning" : "text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase ${toneCls}`}>
        {icon} {label}
      </div>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

