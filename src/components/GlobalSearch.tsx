import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, MapPin, Briefcase } from "lucide-react";
import { PROFISSOES, CIDADES } from "@/lib/mock-data";

// Busca global: casa "profissão em cidade" e leva pra /vagas/:slug.
// Alimenta o SEO direto (query → URL indexável).
export function GlobalSearch({ variant = "header" }: { variant?: "header" | "hero" }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [] as { slug: string; label: string; kind: "prof" | "pair" | "cidade" }[];

    const parts = term.split(/\s+em\s+|\s+/);
    const profTerm = parts[0] ?? "";
    const cityTerm = parts.slice(1).join(" ");

    const profs = PROFISSOES.filter((p) =>
      p.nome.toLowerCase().includes(profTerm) || p.slug.includes(profTerm),
    ).slice(0, 5);

    const cidades = CIDADES.filter((c) => c.toLowerCase().includes(cityTerm || profTerm)).slice(0, 5);

    const out: { slug: string; label: string; kind: "prof" | "pair" | "cidade" }[] = [];

    // combos profissão × cidade (o mais SEO)
    if (profs.length && cityTerm) {
      for (const p of profs) {
        for (const c of cidades) {
          out.push({
            slug: `${p.slug}-em-${c.toLowerCase().replace(/\s+/g, "-")}`,
            label: `${p.emoji} ${p.nome} em ${c}`,
            kind: "pair",
          });
        }
      }
    }
    // só profissão (default cidade = São Paulo)
    for (const p of profs.slice(0, 4)) {
      out.push({
        slug: `${p.slug}-em-sao-paulo`,
        label: `${p.emoji} Vagas de ${p.nome}`,
        kind: "prof",
      });
    }
    // só cidade (usa 1a profissão como âncora)
    if (!profTerm && cidades.length) {
      for (const c of cidades.slice(0, 4)) {
        out.push({
          slug: `pedreiro-em-${c.toLowerCase().replace(/\s+/g, "-")}`,
          label: `📍 Vagas em ${c}`,
          kind: "cidade",
        });
      }
    }
    return out.slice(0, 8);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (slug: string) => {
    setOpen(false);
    setQ("");
    navigate({ to: "/vagas/$slug", params: { slug } });
  };

  const submitFallback = () => {
    if (suggestions[0]) go(suggestions[0].slug);
    else if (q.trim().length >= 2) {
      const slug = q.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (slug.length >= 2) go(slug);
    }
  };

  const isHero = variant === "hero";

  return (
    <div ref={boxRef} className={`relative ${isHero ? "w-full" : "w-full max-w-sm"}`}>
      <form
        onSubmit={(e) => { e.preventDefault(); submitFallback(); }}
        className={`flex items-center gap-2 rounded-full border ${
          isHero
            ? "border-border bg-card px-4 py-3 shadow-pop"
            : "border-white/20 bg-white/10 px-3 py-1.5 text-primary-foreground backdrop-blur"
        }`}
      >
        <Search className={`h-4 w-4 shrink-0 ${isHero ? "text-muted-foreground" : "text-primary-foreground/80"}`} />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setIdx(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
            if (e.key === "Enter" && suggestions[idx]) { e.preventDefault(); go(suggestions[idx].slug); }
          }}
          placeholder={isHero ? "Ex: pedreiro em São Paulo" : "Buscar vaga..."}
          className={`flex-1 bg-transparent text-sm outline-none ${
            isHero ? "placeholder:text-muted-foreground" : "placeholder:text-primary-foreground/70"
          }`}
          aria-label="Buscar vagas por profissão ou cidade"
        />
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-2xl border border-border bg-card p-2 shadow-pop">
          {suggestions.map((s, i) => (
            <li key={s.slug + i}>
              <button
                type="button"
                onClick={() => go(s.slug)}
                onMouseEnter={() => setIdx(i)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${
                  i === idx ? "bg-secondary text-foreground" : "text-foreground hover:bg-secondary"
                }`}
              >
                {s.kind === "cidade" ? <MapPin className="h-4 w-4 text-primary shrink-0" /> : <Briefcase className="h-4 w-4 text-accent shrink-0" />}
                <span className="truncate">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
