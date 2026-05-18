import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, Menu, X, Building2, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/NotificationBell";

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

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-pop">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-extrabold tracking-tight">VagasAgora</p>
            <p className="text-[11px] text-muted-foreground">Emprego perto de você</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-foreground bg-secondary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="rounded-full px-3 py-2 text-sm font-semibold hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <NotificationBell />
              <Link
                to={role === "empresa" ? "/empresa" : role === "candidato" ? "/candidato" : "/cadastro"}
                className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-semibold"
              >
                <UserIcon className="h-4 w-4" /> Minha conta
              </Link>
              <button onClick={handleSignOut} aria-label="Sair"
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="ml-2 rounded-full px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary">
                Entrar
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Building2 className="h-4 w-4" /> Criar conta
              </Link>
            </>
          )}
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationBell />}
          {!user && (
            <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
              Entrar
            </Link>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="border-t border-border bg-background md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-2">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-accent" }}
                className="block rounded-xl px-3 py-3 text-base font-semibold text-foreground hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {user ? (
              <>
                <Link
                  to={role === "empresa" ? "/empresa" : "/cadastro"}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-3 text-base font-semibold text-foreground"
                >
                  <UserIcon className="h-5 w-5" /> Minha conta
                </Link>
                <button onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-base font-semibold text-destructive">
                  <LogOut className="h-5 w-5" /> Sair
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-primary px-3 py-3 text-base font-semibold text-primary-foreground">
                <Building2 className="h-5 w-5" /> Criar conta
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
