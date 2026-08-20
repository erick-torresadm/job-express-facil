import { createFileRoute, Link } from "@tanstack/react-router";
import { PROFISSOES, CIDADES, CATEGORIAS } from "@/lib/mock-data";
import { SITE_URL } from "@/lib/site";
import { Briefcase, Search } from "lucide-react";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Todas as categorias de vagas e profissionais — VagasAgora" },
      {
        name: "description",
        content:
          "Explore mais de 60 categorias de trabalho em 50 cidades brasileiras. Pedreiro, motorista, doméstica, vendedor, cozinheiro e muito mais. Cadastre seu currículo grátis.",
      },
      {
        name: "keywords",
        content:
          "vagas, empregos, currículo grátis, pedreiro, motorista, doméstica, vendedor, cozinheiro, eletricista, encanador, recepcionista, vagas perto de mim",
      },
      { property: "og:title", content: "Todas as categorias de trabalho — VagasAgora" },
      {
        property: "og:description",
        content:
          "Mais de 60 profissões em 50 cidades. Encontre vagas e profissionais perto de você.",
      },
      {
        property: "og:url",
        content: `${SITE_URL}/categorias`,
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `${SITE_URL}/categorias`,
      },
    ],
  }),
  component: CategoriasPage,
});

function CategoriasPage() {
  const porCategoria = CATEGORIAS.map((cat) => ({
    cat,
    profissoes: PROFISSOES.filter((p) => p.categoria === cat),
  }));

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Categorias
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            Todas as profissões
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Mais de <strong>{PROFISSOES.length} profissões</strong> em{" "}
            <strong>{CIDADES.length} cidades</strong>. Clique na sua área e encontre vagas
            ou cadastre seu currículo grátis.
          </p>
        </header>

        <div className="space-y-10">
          {porCategoria.map(({ cat, profissoes }) => (
            <section key={cat}>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold">
                <Briefcase className="h-5 w-5 text-primary" />
                {cat}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {profissoes.map((p) => (
                  <Link
                    key={p.id}
                    to="/vagas/$slug"
                    params={{ slug: `${p.slug}-em-sao-paulo` }}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary"
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold group-hover:text-primary">
                        {p.nome}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Vagas e profissionais
                      </p>
                    </div>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="mb-3 text-xl font-extrabold">Por cidade</h2>
          <div className="flex flex-wrap gap-2">
            {CIDADES.map((c) => {
              const slug = c.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={c}
                  to="/vagas/$slug"
                  params={{ slug: `pedreiro-em-${slug}` }}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  Vagas em {c}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-6 text-center">
          <h3 className="text-2xl font-extrabold">Não achou sua profissão?</h3>
          <p className="mt-2 text-muted-foreground">
            Cadastre seu currículo grátis em 1 minuto. A gente cria a categoria pra você.
          </p>
          <Link
            to="/cadastro"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-pop"
          >
            Criar meu currículo grátis
          </Link>
        </section>
      </main>
    </div>
  );
}
