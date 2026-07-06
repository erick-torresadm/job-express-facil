import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, MapPin, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { CATEGORIAS_FREELA, listFreelancers } from "@/lib/freelas.functions";

export const Route = createFileRoute("/freelas/")({
  head: () => ({
    meta: [
      { title: "Freelas — encontre profissionais autônomos | VagasAgora" },
      {
        name: "description",
        content:
          "Contrate designers, devs, fotógrafos, social media e mais. Vitrine de freelancers verificados, sem comissão, contato direto por WhatsApp.",
      },
      { property: "og:title", content: "Freelas — profissionais autônomos no VagasAgora" },
      {
        property: "og:description",
        content: "Vitrine de freelancers verificados. Sem comissão, contato direto.",
      },
    ],
  }),
  errorComponent: () => <div className="p-8 text-center">Erro ao carregar freelas.</div>,
  notFoundComponent: () => <div className="p-8 text-center">Página não encontrada.</div>,
  component: FreelasHome,
});

function FreelasHome() {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<string>("");
  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState("");

  const { data: freelas, isLoading } = useQuery({
    queryKey: ["freelas", categoria, cidade, q],
    queryFn: () =>
      listFreelancers({
        data: {
          categoria: categoria || undefined,
          cidade: cidade || undefined,
          q: q || undefined,
          limit: 24,
          offset: 0,
        },
      }),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent px-6 py-12 text-primary-foreground shadow-pop md:px-12 md:py-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Vitrine de autônomos
          </span>
          <h1 className="mt-4 font-display text-3xl font-black leading-tight md:text-5xl">
            Contrate freelas sem intermediário.
          </h1>
          <p className="mt-3 text-base text-primary-foreground/90 md:text-lg">
            Designers, devs, fotógrafos, social media, redatores. Fala direto no WhatsApp,
            fecha o combinado do seu jeito. <strong>Sem comissão. Sem leilão de preço.</strong>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/freelancer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary shadow-soft hover:scale-[1.02] transition-transform"
            >
              Sou freela — criar vitrine grátis <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#lista"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-bold backdrop-blur hover:bg-white/25"
            >
              Buscar profissional
            </a>
          </div>
        </div>
      </section>

      {/* Busca */}
      <section id="lista" className="mt-8 rounded-3xl border border-border bg-card p-4 shadow-sm md:p-6">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex: designer de logo, editor de vídeo…"
              className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Cidade (opcional)"
              className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold"
          >
            <option value="">Todas categorias</option>
            {CATEGORIAS_FREELA.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Categorias em destaque */}
      <section className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold">Categorias populares</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIAS_FREELA.slice(0, 8).map((c) => (
            <button
              key={c.slug}
              onClick={() => {
                setCategoria(c.slug);
                document.getElementById("lista")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-2xl border border-border bg-card p-4 text-left text-sm font-semibold transition hover:border-accent hover:shadow-soft"
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Lista */}
      <section className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold">
          {isLoading ? "Buscando…" : `${freelas?.length ?? 0} profissionais disponíveis`}
        </h2>

        {!isLoading && (freelas?.length ?? 0) === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Nenhum freelancer encontrado com esses filtros.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {freelas?.map((f) => (
            <Link
              key={f.id}
              to="/freelas/p/$handle"
              params={{ handle: f.handle }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-pop"
            >
              <div
                className="h-24 w-full bg-gradient-to-br from-primary/20 to-accent/30"
                style={f.cover_url ? { backgroundImage: `url(${f.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              />
              <div className="flex flex-1 flex-col p-4">
                <div className="-mt-10 flex items-end gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-card bg-secondary text-lg font-bold text-primary">
                    {f.avatar_url ? (
                      <img src={f.avatar_url} alt={f.nome} className="h-full w-full object-cover" />
                    ) : (
                      f.nome.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  {f.verificado && (
                    <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      <CheckCircle2 className="h-3 w-3" /> Verificado
                    </span>
                  )}
                </div>
                <h3 className="mt-3 line-clamp-1 font-bold group-hover:text-accent">{f.nome}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{f.headline || "Freelancer"}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(f.skills ?? []).slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{f.cidade ?? "Remoto"}{f.atende_remoto && f.cidade ? " · Remoto" : ""}</span>
                  {f.valor_hora_min != null && (
                    <span className="font-semibold text-foreground">R$ {f.valor_hora_min}/h</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
