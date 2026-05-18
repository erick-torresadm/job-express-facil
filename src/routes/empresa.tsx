import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Building2, Users, PlusSquare, BarChart3, Briefcase } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/empresa")({
  head: () => ({
    meta: [
      { title: "Painel do Recrutador — Vaga Já" },
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
            <p className="text-base font-extrabold">Vaga Já</p>
            <p className="text-xs opacity-70">Painel RH</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <NavItem to="/empresa" icon={<Users className="h-4 w-4" />} label="Candidatos" exact />
          <NavItem to="/empresa/nova-vaga" icon={<PlusSquare className="h-4 w-4" />} label="Nova vaga" />
          <NavItem to="/empresa/minhas-vagas" icon={<Briefcase className="h-4 w-4" />} label="Minhas vagas" />
          <NavItem to="/empresa" icon={<BarChart3 className="h-4 w-4" />} label="Métricas" disabled />
        </nav>
        <div className="m-3 rounded-2xl bg-accent/15 p-4 text-xs">
          <p className="font-bold">Construtora Vega</p>
          <p className="opacity-70">Plano Pro · 47 desbloqueios</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 lg:px-8">
          <EmpresaSaudacao />
          <NotificationBell />
        </header>
        <main className="p-4 lg:p-8">
          {isRoot ? <CandidatosList /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, exact, disabled }: { to: string; icon: React.ReactNode; label: string; exact?: boolean; disabled?: boolean }) {
  if (disabled) {
    return (
      <span className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm opacity-40">
        {icon} {label}
      </span>
    );
  }
  return (
    <Link to={to} activeOptions={{ exact }}
      activeProps={{ className: "bg-accent text-accent-foreground" }}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-primary-foreground/10">
      {icon} {label}
    </Link>
  );
}

function EmpresaSaudacao() {
  const { user } = useAuth();
  const nome = user?.user_metadata?.company_name || user?.user_metadata?.full_name || user?.email || "sua conta";
  return <p className="text-sm text-muted-foreground">Olá, <strong className="text-foreground">{nome}</strong></p>;
}

// inline import to avoid circular file
import { CandidatosList } from "@/components/CandidatosList";
