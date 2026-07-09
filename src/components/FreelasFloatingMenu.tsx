import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu,
  X,
  Search,
  Home,
  Sparkles,
  Palette,
  Code2,
  Video,
  Camera,
  Megaphone,
  Wrench,
  UserPlus,
  Briefcase,
} from "lucide-react";

const QUICK = [
  { icon: Home, label: "Início freelas", to: "/freelas", search: undefined as any },
  { icon: Palette, label: "Design", to: "/freelas", hash: "resultados" },
  { icon: Code2, label: "Dev & Web", to: "/freelas", hash: "resultados" },
  { icon: Video, label: "Vídeo", to: "/freelas", hash: "resultados" },
  { icon: Camera, label: "Fotografia", to: "/freelas", hash: "resultados" },
  { icon: Megaphone, label: "Marketing", to: "/freelas", hash: "resultados" },
  { icon: Wrench, label: "Serviços casa", to: "/freelas", hash: "resultados" },
];

export function FreelasFloatingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu de freelas"}
        className="fixed bottom-6 left-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-pop transition hover:scale-110 sm:bottom-8 sm:left-6"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Painel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-24 left-4 z-40 w-[calc(100vw-2rem)] max-w-xs animate-scale-in rounded-3xl border border-border bg-card p-3 shadow-pop sm:left-6">
            <div className="mb-2 flex items-center justify-between px-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-accent">
                <Sparkles className="h-3.5 w-3.5" /> Freelas
              </span>
              <button
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                aria-label="Fechar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {QUICK.map((q) => (
                <Link
                  key={q.label}
                  to={q.to}
                  hash={q.hash}
                  onClick={() => setOpen(false)}
                  className="group flex flex-col items-start gap-1.5 rounded-2xl border border-border bg-background p-3 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-soft"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <q.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold leading-tight">{q.label}</span>
                </Link>
              ))}
            </div>

            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <Link
                to="/freelancer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-3 py-2.5 text-xs font-black text-primary-foreground"
              >
                <UserPlus className="h-4 w-4" />
                Sou freela — criar vitrine
              </Link>
              <Link
                to="/vagas"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2.5 text-xs font-bold hover:border-accent"
              >
                <Briefcase className="h-4 w-4" />
                Ver vagas CLT/PJ
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex w-full items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2.5 text-xs font-bold hover:border-accent"
              >
                <Search className="h-4 w-4" />
                Buscar profissional
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
