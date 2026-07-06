import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/AdminShell";
import { PushToggle } from "@/components/PushToggle";
import { getAdminStats, getVisitStats } from "@/lib/admin.functions";
import {
  Users, Briefcase, Send, FileText, ShieldAlert, Megaphone,
  TrendingUp, AlertTriangle, Building2, UserCheck, Eye, MousePointerClick,
  Smartphone, Globe, ExternalLink, Search,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin · Dashboard" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

const DEVICE_COLORS: Record<string, string> = {
  mobile: "hsl(var(--primary))",
  desktop: "hsl(var(--accent))",
  tablet: "hsl(var(--muted-foreground))",
};

function AdminDashboard() {
  const fetchStats = useServerFn(getAdminStats);
  const fetchVisits = useServerFn(getVisitStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats() });
  const { data: v, isLoading: vLoading } = useQuery({
    queryKey: ["admin-visit-stats"],
    queryFn: () => fetchVisits(),
    refetchInterval: 60_000,
  });

  return (
    <AdminShell title="Dashboard">
      <div className="mb-4">
        <PushToggle />
      </div>
      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      ) : (
        <>
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

          {/* ===== KPIs de VISITAS ===== */}
          <SectionTitle icon={<Eye className="h-4 w-4" />} title="Tráfego do site" subtitle="Últimos 30 dias · humanos (bots filtrados)" />
          {vLoading || !v ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-card" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <BigStat label="Visitas 24h" value={v.totais.visitas_24h} hint={`${v.totais.sessoes_24h} pessoas`} accent />
                <BigStat label="Visitas 7d" value={v.totais.visitas_7d} hint={`${v.totais.sessoes_7d} pessoas`} />
                <BigStat label="Visitas 30d" value={v.totais.visitas_30d} hint={`${v.totais.sessoes_30d} pessoas`} />
                <BigStat label="Páginas/pessoa (30d)" value={v.totais.sessoes_30d ? Math.round((v.totais.visitas_30d / v.totais.sessoes_30d) * 10) / 10 : 0} />
              </div>

              {/* Série diária */}
              <Card className="mt-4">
                <CardHeader title="Visitas por dia" subtitle="Últimos 30 dias" />
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={v.serie_diaria} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="dia" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="visitas" stroke="hsl(var(--primary))" fill="url(#gv)" strokeWidth={2} />
                      <Area type="monotone" dataKey="sessoes" stroke="hsl(var(--accent))" fill="transparent" strokeWidth={2} strokeDasharray="4 3" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Funil */}
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardHeader title="Funil de conversão" subtitle="Últimos 30 dias" />
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={v.funil} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="etapa" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[11px] text-muted-foreground">
                    {v.funil.map((f, i) => {
                      const base = v.funil[0].valor || 1;
                      const pct = Math.round((f.valor / base) * 1000) / 10;
                      return (
                        <div key={f.etapa}>
                          <p className="font-bold text-foreground">{f.valor.toLocaleString("pt-BR")}</p>
                          <p>{i === 0 ? "base" : `${pct}%`}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card>
                  <CardHeader title="Dispositivos" icon={<Smartphone className="h-3.5 w-3.5" />} />
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={v.dispositivos} dataKey="views" nameKey="nome" innerRadius={40} outerRadius={70} paddingAngle={3}>
                          {v.dispositivos.map((d) => (
                            <Cell key={d.nome} fill={DEVICE_COLORS[d.nome] ?? "hsl(var(--muted-foreground))"} />
                          ))}
                        </Pie>
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Top páginas + top referrers + países */}
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader title="Páginas mais vistas" icon={<MousePointerClick className="h-3.5 w-3.5" />} />
                  <TopList items={v.top_paginas.map((p) => ({ label: p.path, value: p.views }))} />
                </Card>
                <Card>
                  <CardHeader title="De onde vem o tráfego" icon={<ExternalLink className="h-3.5 w-3.5" />} />
                  <TopList items={v.top_referrers.map((r) => ({ label: r.source, value: r.views }))} />
                </Card>
                <Card>
                  <CardHeader title="Países" icon={<Globe className="h-3.5 w-3.5" />} />
                  <TopList items={v.top_paises.map((p) => ({ label: p.pais, value: p.views }))} />
                </Card>
              </div>

              {/* Google Search Console */}
              <div className="mt-4">
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-4 hover:from-primary/20 hover:to-accent/20"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold">Google Search Console</p>
                    <p className="text-xs text-muted-foreground">Ver impressões, cliques e posição média no Google. Verificação por meta tag já embutida no site.</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            </>
          )}

          {/* ===== KPIs OPERACIONAIS ===== */}
          <SectionTitle icon={<TrendingUp className="h-4 w-4" />} title="Operação" subtitle="Cadastro, vagas e conversões" />
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

/* ============ helpers de UI ============ */
function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between">
      <div className="flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center rounded-md bg-secondary text-foreground">{icon}</div>
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">{title}</h2>
      </div>
      {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-4 shadow-soft ${className}`}>{children}</div>;
}
function CardHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-sm font-bold">{title}</p>
      </div>
      {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
function TopList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <p className="text-xs text-muted-foreground">Sem dados ainda.</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((i) => (
        <li key={i.label} className="text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium text-foreground" title={i.label}>{i.label}</span>
            <span className="tabular-nums text-muted-foreground">{i.value.toLocaleString("pt-BR")}</span>
          </div>
          <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
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
function BigStat({ label, value, hint, accent }: { label: string; value: number; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-soft ${accent ? "border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10" : "border-border bg-card"}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-black leading-none">{value.toLocaleString("pt-BR")}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
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
