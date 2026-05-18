import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Users, PlusSquare, BarChart3, Briefcase, Globe, ShieldCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/hooks/use-auth";
import { getRevelacoesInfo } from "@/lib/empresa.functions";

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

// inline import to avoid circular file
import { CandidatosList } from "@/components/CandidatosList";
