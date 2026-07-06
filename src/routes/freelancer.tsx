import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, LayoutDashboard, User, Briefcase, MessageSquare, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/freelancer")({
  head: () => ({
    meta: [
      { title: "Área do Freelancer — VagasAgora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FreelancerLayout,
});

const NAV = [
  { to: "/freelancer", label: "Painel", icon: LayoutDashboard, exact: true },
  { to: "/freelancer/perfil", label: "Meu perfil", icon: User },
  { to: "/freelancer/portfolio", label: "Portfólio", icon: Briefcase },
  { to: "/freelancer/orcamentos", label: "Orçamentos", icon: MessageSquare },
] as const;

function FreelancerLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Site
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-sm font-bold">Área do Freelancer</span>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
