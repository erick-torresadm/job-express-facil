import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Building2, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/NotificationBell";
import { GlobalSearch } from "@/components/GlobalSearch";



const navLinks = [
  { to: "/", label: "Início" },
  { to: "/como-funciona", label: "Como funciona" },
  { to: "/para-empresas", label: "Para empresas" },
  { to: "/blog", label: "Blog" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  if (!isHome) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="fixed left-3 top-3 z-40 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-primary/85 text-primary-foreground shadow-pop backdrop-blur-xl md:left-5 md:top-5"
        >
          <Menu className="h-5 w-5" />
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col gap-2 border-r border-border/60 bg-background/95 p-4 shadow-pop backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <Link to="/" onClick={() => setOpen(false)} className="font-display text-lg font-extrabold tracking-tight text-foreground">
                  VagasAgora
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fechar menu"
                  className="grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-2 flex flex-col">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: l.to === "/" }}
                    activeProps={{ className: "text-accent bg-secondary/60" }}
                    className="block rounded-2xl px-3 py-3 text-base font-semibold text-foreground hover:bg-secondary"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="my-2 h-px bg-border" />
              {user ? (
                <>
                  {<NotificationBell />}
                  <Link
                    to="/perfil"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-2xl px-3 py-3 text-base font-semibold text-foreground hover:bg-secondary"
                  >
                    <UserIcon className="h-5 w-5" /> Meu perfil
                  </Link>
                  <Link
                    to={role === "empresa" ? "/empresa" : role === "candidato" ? "/candidato" : "/cadastro"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-2xl px-3 py-3 text-base font-semibold text-foreground hover:bg-secondary"
                  >
                    <UserIcon className="h-5 w-5" /> Minha conta
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-base font-semibold text-destructive hover:bg-secondary"
                  >
                    <LogOut className="h-5 w-5" /> Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-3 py-3 text-base font-semibold text-primary-foreground"
                >
                  <Building2 className="h-5 w-5" /> Criar conta
                </Link>
              )}
            </aside>
          </div>
        )}
      </>
    );
  }

  return (
    <header className="fixed inset-x-0 top-3 z-30 px-3 md:top-5 md:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-white/10 bg-primary/80 px-4 py-2.5 text-primary-foreground shadow-pop backdrop-blur-xl supports-[backdrop-filter]:bg-primary/60">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)} aria-label="VagasAgora">
          <span className="font-display text-lg font-extrabold tracking-tight text-primary-foreground md:text-xl">
            VagasAgora
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-primary-foreground bg-white/15" }}
              inactiveProps={{ className: "text-primary-foreground/70" }}
              className="rounded-full px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-white/10 hover:text-primary-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Busca global desktop */}
        <div className="hidden flex-1 justify-center px-2 md:flex lg:max-w-xs">
          <GlobalSearch />
        </div>



        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <NotificationBell />
              <Link
                to="/perfil"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-white/20"
              >
                <UserIcon className="h-4 w-4" /> Meu perfil
              </Link>
              <Link
                to={role === "empresa" ? "/empresa" : role === "candidato" ? "/candidato" : "/cadastro"}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-white/25"
              >
                <UserIcon className="h-4 w-4" /> Minha conta
              </Link>
              <button onClick={handleSignOut} aria-label="Sair"
                className="grid h-9 w-9 place-items-center rounded-full text-primary-foreground/80 hover:bg-white/15">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-white/10">
                Entrar
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-soft transition-transform hover:scale-[1.02]">
                <Building2 className="h-4 w-4" /> Criar conta
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationBell />}
          {!user && (
            <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground shadow-soft">
              Entrar
            </Link>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-primary/80 text-primary-foreground backdrop-blur-xl"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="mx-auto mt-2 max-w-6xl rounded-3xl border border-border/60 bg-background/95 p-2 shadow-pop backdrop-blur-xl md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-accent bg-secondary/60" }}
              className="block rounded-2xl px-3 py-3 text-base font-semibold text-foreground hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
          <div className="my-2 h-px bg-border" />
          {user ? (
            <>
              <Link
                to={role === "empresa" ? "/empresa" : role === "candidato" ? "/candidato" : "/cadastro"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-2xl px-3 py-3 text-base font-semibold text-foreground"
              >
                <UserIcon className="h-5 w-5" /> Minha conta
              </Link>
              <button onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-base font-semibold text-destructive">
                <LogOut className="h-5 w-5" /> Sair
              </button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-3 py-3 text-base font-semibold text-primary-foreground">
              <Building2 className="h-5 w-5" /> Criar conta
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
