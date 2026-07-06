import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, MapPin, Filter, Briefcase, Zap, ArrowRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Regime = "clt" | "pj" | "estagio" | "outros";

export type VagaPublica = {
  id: string;
  titulo: string;
  empresa_nome: string;
  bairro: string;
  cidade: string;
  salario: string;
  horario: string;
  profissao_slug: string;
  urgente: boolean;
  created_at: string;
  regime: Regime;
};

const TABS: Array<{ to: "/vagas" | "/vagas/clt" | "/vagas/pj" | "/vagas/estagio"; label: string; regime: Regime | "todos"; desc: string }> = [
  { to: "/vagas", label: "Todas", regime: "todos", desc: "Todas as oportunidades" },
  { to: "/vagas/clt", label: "CLT", regime: "clt", desc: "Carteira assinada" },
  { to: "/vagas/pj", label: "PJ", regime: "pj", desc: "Autônomo, MEI e microempresa" },
  { to: "/vagas/estagio", label: "Estágio", regime: "estagio", desc: "Universitários e trainees" },
];

const REGIME_LABEL: Record<Regime, string> = {
  clt: "CLT", pj: "PJ", estagio: "Estágio", outros: "Outros",
};

function slugCidade(cidade: string) {
  return cidade.toLowerCase().replace(/\s+/g, "-");
}

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "há poucos minutos";
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d} dias`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface Props {
  regime: Regime | "todos";
  titulo: string;
  subtitulo: string;
}

export function VagasPublicListing({ regime, titulo, subtitulo }: Props) {
  const [vagas, setVagas] = useState<VagaPublica[] | null>(null);
  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState("");
  const [urgente, setUrgente] = useState(false);
  const [totalPorRegime, setTotalPorRegime] = useState<Record<Regime | "todos", number>>({
    todos: 0, clt: 0, pj: 0, estagio: 0, outros: 0,
  });

  useEffect(() => {
    (async () => {
      setVagas(null);
      let query = supabase.from("vagas")
        .select("id,titulo,empresa_nome,bairro,cidade,salario,horario,profissao_slug,urgente,created_at,regime")
        .eq("ativa", true)
        .lt("risco_fraude", 70)
        .order("urgente", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(80);
      if (regime !== "todos") query = query.eq("regime", regime);
      if (q.trim()) query = query.or(`titulo.ilike.%${q}%,empresa_nome.ilike.%${q}%,profissao.ilike.%${q}%`);
      if (cidade.trim()) query = query.ilike("cidade", `%${cidade}%`);
      if (urgente) query = query.eq("urgente", true);
      const { data } = await query;
      setVagas((data ?? []) as VagaPublica[]);
    })();
  }, [regime, q, cidade, urgente]);

  useEffect(() => {
    (async () => {
      const call = (r?: Regime) => {
        const qb = supabase.from("vagas")
          .select("id", { count: "exact", head: true })
          .eq("ativa", true).lt("risco_fraude", 70);
        return r ? qb.eq("regime", r) : qb;
      };
      const [{ count: t }, { count: c }, { count: p }, { count: e }, { count: o }] = await Promise.all([
        call(), call("clt"), call("pj"), call("estagio"), call("outros"),
      ]);
      setTotalPorRegime({
        todos: t ?? 0, clt: c ?? 0, pj: p ?? 0, estagio: e ?? 0, outros: o ?? 0,
      });
    })();
  }, []);

  const activeFilters = [
    q && { k: "q", label: `"${q}"`, clear: () => setQ("") },
    cidade && { k: "c", label: cidade, clear: () => setCidade("") },
    urgente && { k: "u", label: "Urgente", clear: () => setUrgente(false) },
  ].filter(Boolean) as { k: string; label: string; clear: () => void }[];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      {/* Header */}
      <header className="mb-6">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
          <Briefcase className="h-3 w-3" /> Vagas abertas
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{titulo}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitulo}</p>
      </header>

      {/* CTA persistente — cadastro rápido */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-accent/30 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 p-4">
        <div className="flex items-start gap-3">
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="text-sm font-bold">Quer receber as vagas certas no WhatsApp?</p>
            <p className="text-xs text-muted-foreground">Crie seu perfil em 60s (áudio ou vídeo) e ganhe Pro grátis por 2 anos.</p>
          </div>
        </div>
        <Link to="/cadastro" className="shrink-0 rounded-xl bg-accent px-4 py-2 text-xs font-extrabold text-accent-foreground shadow-pop transition hover:scale-[1.02]">
          Criar perfil grátis →
        </Link>
      </div>



      {/* Tabs (regime) */}
      <nav className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => {
          const active = t.regime === regime;
          const cnt = totalPorRegime[t.regime];
          return (
            <Link key={t.to} to={t.to}
              className={`group flex min-w-[9rem] shrink-0 flex-col rounded-2xl border p-3 transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-pop"
                  : "border-border bg-card hover:border-primary/40"
              }`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-black">{t.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  active ? "bg-primary-foreground/20" : "bg-secondary text-secondary-foreground"
                }`}>{cnt}</span>
              </div>
              <span className={`mt-1 text-[10px] ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {t.desc}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Filtros */}
      <div className="mb-4 rounded-2xl border border-border bg-card p-3 shadow-soft sm:p-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Cargo, profissão ou empresa"
              className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </label>
          <label className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={cidade} onChange={(e) => setCidade(e.target.value)}
              placeholder="Cidade"
              className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </label>
          <button onClick={() => setUrgente((u) => !u)}
            className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-bold transition ${
              urgente ? "border-warning bg-warning text-warning-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}>
            <Zap className="h-4 w-4" /> Urgentes
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Filter className="h-3 w-3 text-muted-foreground" />
            {activeFilters.map((f) => (
              <button key={f.k} onClick={f.clear}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
                {f.label} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista */}
      {vagas === null ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      ) : vagas.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
          <p className="text-base font-bold">Nenhuma vaga encontrada</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente remover filtros ou cadastre-se grátis pra ser avisado quando abrir vaga nova.
          </p>
          <Link to="/cadastro" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
            Cadastrar meu currículo grátis
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span><strong className="text-foreground">{vagas.length}</strong> vaga{vagas.length > 1 ? "s" : ""} encontrada{vagas.length > 1 ? "s" : ""}</span>
            <span>Ordenado por urgentes primeiro</span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {vagas.map((v) => (
              <li key={v.id}>
                <Link
                  to="/vagas/$slug"
                  params={{ slug: `${v.profissao_slug}-em-${slugCidade(v.cidade)}` }}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:border-primary/50 hover:shadow-pop"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                          {REGIME_LABEL[v.regime]}
                        </span>
                        {v.urgente && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-warning/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-warning">
                            <Zap className="h-2.5 w-2.5" /> Urgente
                          </span>
                        )}
                      </div>
                      <h2 className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-tight group-hover:text-primary">
                        {v.titulo}
                      </h2>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{v.empresa_nome}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {v.bairro}, {v.cidade}
                    </p>
                    <p className="line-clamp-1"><strong className="text-foreground">💰 {v.salario}</strong></p>
                    <p className="line-clamp-1">🕒 {v.horario}</p>
                  </div>

                  <footer className="mt-auto flex items-center justify-between border-t border-border pt-2 text-[11px]">
                    <span className="text-muted-foreground">{tempoRelativo(v.created_at)}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-primary">
                      Ver vaga <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                    </span>
                  </footer>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* CTA final */}
      <section className="mt-10 rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 text-center shadow-soft sm:p-8">
        <h3 className="text-xl font-black sm:text-2xl">Ainda não achou a sua?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre seu currículo grátis por áudio em 1 minuto e receba propostas de empresas verificadas no WhatsApp.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link to="/cadastro" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            Criar currículo grátis
          </Link>
          <Link to="/como-funciona" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold">
            Como funciona
          </Link>
        </div>
      </section>
    </div>
  );
}
