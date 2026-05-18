import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Briefcase, Clock } from "lucide-react";
import { PROFISSOES, CIDADES } from "@/lib/mock-data";
import { listarProfissionaisPublicos } from "@/lib/profissionais.functions";

// SEO route: /profissionais/{profissao-slug}-em-{cidade-slug}
// Renderiza profissionais anonimizados disponíveis (sem nome, sem contato).
// Objetivo: ranquear no Google para "pedreiro em São Paulo disponível" etc.

function parseSlug(slug: string) {
  const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const parts = clean.split("-em-");
  const profPart = (parts[0] ?? "").replace(/-/g, " ");
  const locPart = (parts[1] ?? "").replace(/-/g, " ");
  const prof = PROFISSOES.find((p) => clean.includes(p.slug)) ?? null;
  const cidade =
    CIDADES.find((c) => locPart.includes(c.toLowerCase())) ??
    (locPart ? capitalize(locPart) : "Brasil");
  const profissao = prof?.nome ?? capitalize(profPart);
  return { profissao, cidade, profSlug: prof?.slug ?? clean, prof };
}
function capitalize(s: string) {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/profissionais/$slug")({
  loader: async ({ params }) => {
    const { profissao, cidade, profSlug, prof } = parseSlug(params.slug);
    const { profissionais } = await listarProfissionaisPublicos({
      data: {
        profissao: prof?.nome ?? profissao,
        cidade: cidade !== "Brasil" ? cidade : undefined,
        limit: 30,
      },
    });
    return { profissao, cidade, profSlug, profissionais };
  },
  head: ({ loaderData, params }) => {
    type Prof = { id: string; profissao: string; bairro: string | null; cidade: string | null; resumo: string };
    const d = (loaderData ?? { profissao: "Profissionais", cidade: "Brasil", profissionais: [] as Prof[] }) as { profissao: string; cidade: string; profissionais: Prof[] };
    const { profissao, cidade, profissionais } = d;
    const count = profissionais.length;
    const title =
      count > 0
        ? `${count} ${profissao} disponíveis em ${cidade} — Contrate hoje | VagasAgora`
        : `${profissao} em ${cidade} — Profissionais disponíveis | VagasAgora`;
    const description =
      count > 0
        ? `Encontre ${count} profissionais de ${profissao} disponíveis em ${cidade} agora. Currículos verificados, contato direto. Cadastre sua vaga grátis.`
        : `Procurando ${profissao} em ${cidade}? Veja profissionais cadastrados e disponíveis para contratação imediata. Sem taxa, sem burocracia.`;
    const url = `https://job-express-facil.lovable.app/profissionais/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: `${profissao}, ${profissao} ${cidade}, contratar ${profissao}, ${profissao} disponível, vaga ${profissao}, currículo ${profissao} ${cidade}` },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${profissao} disponíveis em ${cidade}`,
            numberOfItems: count,
            itemListElement: profissionais.slice(0, 10).map((p: { profissao: string; bairro: string | null; cidade: string | null; resumo: string }, i: number) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Person",
                jobTitle: p.profissao,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: p.cidade ?? cidade,
                  addressRegion: p.bairro ?? undefined,
                  addressCountry: "BR",
                },
                description: p.resumo,
              },
            })),
          }),
        },
      ],
    };
  },
  component: ProfissionaisPage,
});

function ProfissionaisPage() {
  const { profissao, cidade, profissionais } = Route.useLoaderData();
  const count = profissionais.length;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/categorias"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Todas as categorias
        </Link>

        <header className="mt-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Profissionais disponíveis
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight md:text-4xl">
            {count > 0 ? (
              <>
                {count} <span className="text-primary">{profissao}</span> em {cidade}
              </>
            ) : (
              <>
                <span className="text-primary">{profissao}</span> em {cidade}
              </>
            )}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {count > 0
              ? `Profissionais de ${profissao} cadastrados e disponíveis para contratação em ${cidade}. Currículos anonimizados — entre em contato após cadastrar sua empresa.`
              : `Ainda não há ${profissao} cadastrados em ${cidade}. Publique sua vaga grátis e seja avisado assim que um profissional se cadastrar.`}
          </p>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/empresa"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop hover:scale-[1.02]"
          >
            Contratar agora
          </Link>
          <Link
            to="/cadastro"
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold hover:border-primary"
          >
            Sou {profissao}, quero me cadastrar
          </Link>
        </div>

        {profissionais.length > 0 && (
          <section className="mt-8 space-y-3">
            {profissionais.map((p, i) => (
              <article
                key={p.id}
                className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-extrabold">
                      Profissional #{String(i + 1).padStart(3, "0")} — {p.profissao}
                    </h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {p.bairro && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {p.bairro}
                          {p.cidade ? `, ${p.cidade}` : ""}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Disponível
                      </span>
                    </p>
                    {p.resumo && (
                      <p className="mt-2 line-clamp-3 text-sm text-foreground/80">
                        {p.resumo}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Link
                    to="/empresa"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Ver contato (empresa) →
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-6">
          <h3 className="text-xl font-extrabold">É {profissao}? Apareça aqui de graça</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie seu currículo em 1 minuto e fique visível para empresas que procuram{" "}
            <strong>{profissao} em {cidade}</strong> no Google. Sem nome exposto — só sua
            profissão e bairro até a empresa entrar em contato.
          </p>
          <Link
            to="/cadastro"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-pop"
          >
            Criar meu currículo grátis
          </Link>
        </section>

        <section className="mt-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Outras cidades para {profissao}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {CIDADES.filter((c) => c !== cidade)
              .slice(0, 12)
              .map((c) => {
                const profSlugPart = profissionais[0]?.profissao
                  ? profissao.toLowerCase().replace(/\s+/g, "-")
                  : profissao.toLowerCase().replace(/\s+/g, "-");
                const citySlug = c.toLowerCase().replace(/\s+/g, "-");
                return (
                  <Link
                    key={c}
                    to="/profissionais/$slug"
                    params={{ slug: `${profSlugPart}-em-${citySlug}` }}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-foreground"
                  >
                    {profissao} em {c}
                  </Link>
                );
              })}
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Outras profissões em {cidade}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROFISSOES.slice(0, 18).map((p) => {
              const citySlug = cidade.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={p.id}
                  to="/profissionais/$slug"
                  params={{ slug: `${p.slug}-em-${citySlug}` }}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  {p.emoji} {p.nome} em {cidade}
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
