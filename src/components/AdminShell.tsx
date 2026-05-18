import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Briefcase, Users, ShieldCheck, Megaphone,
  ArrowLeft, Menu, X, LogOut, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/vagas", label: "Vagas", icon: Briefcase, exact: false },
  { to: "/admin/usuarios", label: "Usuários", icon: Users, exact: false },
  { to: "/admin/verificacoes", label: "Verificações", icon: ShieldCheck, exact: false },
  { to: "/admin/anuncios", label: "Anúncios", icon: Megaphone, exact: false },
] as const;

/**
 * Shell padrão do painel admin: sidebar fixa (desktop), drawer (mobile),
 * guard de role 'admin' e header com identificação.
 */
export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/auth" }); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => {
        if (!data) { nav({ to: "/" }); return; }
        setIsAdmin(true);
      });
  }, [user, loading, nav]);

  if (loading || isAdmin === null) {
    return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const isActive = (to: string, exact: boolean) => exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-secondary/40">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="border-b border-border p-4">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
          </Link>
          <p className="mt-2 font-display text-lg font-extrabold">Admin</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive(n.to, n.exact) ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground hover:bg-secondary"
              }`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => signOut().then(() => nav({ to: "/" }))}
          className="m-3 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </aside>

      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpenMobile(true)} aria-label="Abrir menu"
              className="grid h-9 w-9 place-items-center rounded-lg border border-border md:hidden">
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="font-display text-lg font-extrabold leading-none md:text-xl">{title}</h1>
          </div>
          <Link to="/admin" className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
            modo admin
          </Link>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>

      {/* Drawer mobile */}
      {openMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenMobile(false)} />
          <aside className="relative z-10 flex h-full w-64 flex-col border-r border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-extrabold">Admin</p>
              <button onClick={() => setOpenMobile(false)} aria-label="Fechar"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border"><X className="h-4 w-4" /></button>
            </div>
            <nav className="mt-3 space-y-1">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpenMobile(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                    isActive(n.to, n.exact) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                  }`}>
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
