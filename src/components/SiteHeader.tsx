import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, Menu, X, Building2 } from "lucide-react";

const navLinks = [
  { to: "/", label: "Início" },
  { to: "/como-funciona", label: "Como funciona" },
  { to: "/para-empresas", label: "Para empresas" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground shadow-pop">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-extrabold">Vaga Já</p>
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
          <Link to="/empresa" className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Building2 className="h-4 w-4" /> Sou empresa
          </Link>
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/empresa" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
            <Building2 className="h-3.5 w-3.5" /> Empresa
          </Link>
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
          </div>
        </nav>
      )}
    </header>
  );
}
