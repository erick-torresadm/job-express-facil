import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Building2, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/NotificationBell";
import { GlobalSearch } from "@/components/GlobalSearch";



const navLinks = [
  { to: "/", label: "Início" },
  { to: "/vagas", label: "Vagas" },
  { to: "/freelas", label: "Freelas" },
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
    navigate({ to: "/auth", replace: true });
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
      <div className="mx-auto flex max-w-6xl items-center gap-2 rounded-full border border-white/10 bg-primary/80 px-3 py-2 text-primary-foreground shadow-pop backdrop-blur-xl supports-[backdrop-filter]:bg-primary/60 md:gap-3 md:px-4 md:py-2.5">
        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)} aria-label="VagasAgora">
          <span className="font-display text-lg font-extrabold tracking-tight text-primary-foreground md:text-xl">
            VagasAgora
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden min-w-0 items-center gap-0.5 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-primary-foreground bg-white/15" }}
              inactiveProps={{ className: "text-primary-foreground/70" }}
              className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition-colors hover:bg-white/10 hover:text-primary-foreground lg:px-3 lg:py-2 lg:text-sm"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Busca global desktop — só em telas grandes */}
        <div className="ml-auto hidden shrink-0 lg:flex lg:w-56 xl:w-64">
          <GlobalSearch />
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-1.5 md:flex lg:ml-2">
          {user ? (
            <>
              <NotificationBell />
              <Link
                to={role === "empresa" ? "/empresa" : role === "candidato" ? "/candidato" : "/cadastro"}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-semibold text-primary-foreground hover:bg-white/25 lg:px-4 lg:py-2 lg:text-sm"
              >
                <UserIcon className="h-4 w-4" /> Minha conta
              </Link>
              <button onClick={handleSignOut} aria-label="Sair" title="Sair"
                className="grid h-9 w-9 place-items-center rounded-full text-primary-foreground/80 hover:bg-white/15">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-primary-foreground hover:bg-white/10 lg:px-4 lg:py-2 lg:text-sm">
                Entrar
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[13px] font-semibold text-accent-foreground shadow-soft transition-transform hover:scale-[1.02] lg:px-4 lg:py-2 lg:text-sm">
                <Building2 className="h-4 w-4" /> Criar conta
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
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
          <div className="px-1 pb-2">
            <GlobalSearch variant="hero" />
          </div>
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
