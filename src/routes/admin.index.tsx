import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/AdminShell";
import { getAdminStats } from "@/lib/admin.functions";
import {
  Users, Briefcase, Send, FileText, ShieldAlert, Megaphone,
  TrendingUp, AlertTriangle, Building2, UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin · Dashboard" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchStats = useServerFn(getAdminStats);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchStats(),
  });

  return (
    <AdminShell title="Dashboard">
      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      ) : (
        <>
          {/* Alertas críticos */}
          {(data.verifPendentes > 0 || data.vagasRisco > 0) && (
            <div className="mb-5 grid gap-3 md:grid-cols-2">
              {data.verifPendentes > 0 && (
                <Link to="/admin/verificacoes" className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 hover:bg-warning/15">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-warning text-warning-foreground"><ShieldAlert className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold">{data.verifPendentes} verificação(ões) pendente(s)</p>
                    <p className="text-xs text-muted-foreground">Empresas aguardando aprovação</p>
                  </div>
                </Link>
              )}
              {data.vagasRisco > 0 && (
                <Link to="/admin/vagas" search={{ filtro: "risco" }} className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 hover:bg-destructive/15">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive text-destructive-foreground"><AlertTriangle className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold">{data.vagasRisco} vaga(s) com alto risco de fraude</p>
                    <p className="text-xs text-muted-foreground">Revise e desative se necessário</p>
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* KPIs principais */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={<Users className="h-4 w-4" />} label="Usuários" value={data.totalUsuarios} />
            <Stat icon={<UserCheck className="h-4 w-4" />} label="Candidatos" value={data.totalCandidatos} />
            <Stat icon={<Building2 className="h-4 w-4" />} label="Empresas" value={data.totalEmpresas} />
            <Stat icon={<Briefcase className="h-4 w-4" />} label="Vagas ativas" value={data.vagasAtivas} hint={`${data.vagasTotal} no total`} />
            <Stat icon={<Send className="h-4 w-4" />} label="Candidaturas" value={data.candidaturas} hint={`+${data.candidaturas7d} em 7d`} accent />
            <Stat icon={<FileText className="h-4 w-4" />} label="Currículos" value={data.curriculos} />
            <Stat icon={<TrendingUp className="h-4 w-4" />} label="Vagas novas (7d)" value={data.novasVagas7d} accent />
            <Stat icon={<Megaphone className="h-4 w-4" />} label="Anúncios ativos" value={data.anunciosAtivos} />
          </div>

          {/* Atalhos */}
          <h2 className="mb-3 mt-8 text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Atalhos</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Atalho to="/admin/vagas" icon={<Briefcase />} title="Moderar vagas" desc="Desativar suspeitas, ver riscos de fraude" />
            <Atalho to="/admin/usuarios" icon={<Users />} title="Gerenciar usuários" desc="Buscar candidatos e empresas" />
            <Atalho to="/admin/anuncios" icon={<Megaphone />} title="Anúncios" desc="Criar, pausar e medir performance" />
          </div>
        </>
      )}
    </AdminShell>
  );
}

function Stat({ icon, label, value, hint, accent }: { icon: React.ReactNode; label: string; value: number; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}>{icon}</div>
      <p className="mt-2 text-2xl font-black leading-none">{value.toLocaleString("pt-BR")}</p>
      <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Atalho({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-soft">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="font-bold leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}
