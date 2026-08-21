import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Wallet, TrendingUp, ArrowRight, ChevronDown, Briefcase, MapPin, Clock } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { getSalarioInfo, listarSalarios, fatoresDe } from "@/lib/salarios-data";
import { listarVagasPublicas, type VagaPublica } from "@/lib/vagas.functions";

// Página programática de salário por profissão (Brasil) — atrai candidato
// pelo Google mesmo quando ainda não há vaga aberta da profissão no site.

function moeda(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function buildFAQ(info: NonNullable<ReturnType<typeof getSalarioInfo>>) {
  const nome = info.nome.toLowerCase();
  return [
    {
      q: `Quanto ganha um profissional de ${nome} por mês?`,
      a: `No Brasil, em 2026, a média fica em torno de ${moeda(info.media)} por mês. O piso costuma ser ${moeda(info.piso)} e profissionais experientes chegam a ${moeda(info.teto)} ou mais, dependendo da cidade, do porte da empresa e dos adicionais (noturno, insalubridade, horas extras).`,
    },
    ...(info.diaria ? [{
      q: `Quanto cobra um profissional de ${nome} por dia?`,
      a: `A diária média fica em torno de ${moeda(info.diaria)}, variando com a região e a complexidade do serviço. Trabalhar por diária costuma render mais que o salário fixo pra quem tem agenda cheia.`,
    }] : []),
    {
      q: `O que faz um profissional de ${nome}?`,
      a: `${info.resumo} No VagasAgora você encontra vagas dessa área com salário, horário e endereço claros no anúncio.`,
    },
    {
      q: `Como ganhar mais nessa profissão?`,
      a: `Os fatores que mais aumentam o salário: ${fatoresDe(info.categoria).join("; ").toLowerCase()}.`,
    },
    {
      q: `Onde encontrar vagas de ${nome}?`,
      a: `No VagasAgora você cadastra seu currículo grátis em 1 minuto (pode gravar por áudio) e se candidata direto — a empresa te chama no WhatsApp, sem taxa e sem intermediário.`,
    },
  ];
}

export const Route = createFileRoute("/salarios/$slug")({
  loader: async ({ params }) => {
    const info = getSalarioInfo(params.slug);
    if (!info) throw notFound();
    // Vagas reais da profissão — prova social + links internos
    const { vagas } = await listarVagasPublicas({ data: { profissaoSlug: params.slug, limit: 6 } }).catch(() => ({ vagas: [] as VagaPublica[] }));
    return { info, vagas: vagas as VagaPublica[] };
  },
  head: ({ params, loaderData }) => {
    const info = loaderData?.info;
    if (!info) return { meta: [{ title: "Salários — VagasAgora" }] };
    const year = new Date().getFullYear();
    const title = `Quanto ganha um ${info.nome}? Salário ${year}: média, piso e teto | VagasAgora`;
    const description = `Salário de ${info.nome} no Brasil em ${year}: média de ${moeda(info.media)}/mês, piso de ${moeda(info.piso)} e teto de ${moeda(info.teto)}.${info.diaria ? ` Diária média: ${moeda(info.diaria)}.` : ""} Veja como ganhar mais e encontre vagas abertas.`;
    const canonical = `${SITE_URL}/salarios/${params.slug}`;
    const faq = buildFAQ(info);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { property: "og:locale", content: "pt_BR" },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          // Schema Occupation com estimatedSalary — rich result de salário do Google
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Occupation",
            name: info.nome,
            description: info.resumo,
            estimatedSalary: [{
              "@type": "MonetaryAmountDistribution",
              name: "base",
              currency: "BRL",
              duration: "P1M",
              percentile10: info.piso,
              median: info.media,
              percentile90: info.teto,
            }],
            occupationLocation: [{ "@type": "Country", name: "Brasil" }],
            mainEntityOfPage: { "@type": "WebPage", lastReviewed: new Date().toISOString().split("T")[0] },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Salários", item: `${SITE_URL}/salarios` },
              { "@type": "ListItem", position: 3, name: info.nome, item: canonical },
            ],
          }),
        },
      ],
    };
  },
  component: SalarioPage,
  notFoundComponent: () => (
    <div className="grid min-h-[60vh] place-items-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-extrabold">Profissão não encontrada</h1>
        <Link to="/salarios" className="mt-4 inline-block text-primary underline">Ver tabela de salários</Link>
      </div>
    </div>
  ),
});

function SalarioPage() {
  const { info, vagas } = Route.useLoaderData();
  const faq = buildFAQ(info);
  const fatores = fatoresDe(info.categoria);
  const relacionados = listarSalarios().filter((s) => s.categoria === info.categoria && s.slug !== info.slug).slice(0, 6);
  const year = new Date().getFullYear();
  // Escala das barras piso/média/teto proporcional ao teto
  const pct = (v: number) => Math.max(18, Math.round((v / info.teto) * 100));

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link> ·{" "}
          <Link to="/salarios" className="hover:text-foreground">Salários</Link> ·{" "}
          <span className="text-foreground">{info.nome}</span>
        </nav>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{info.categoria}</p>
        <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          Quanto ganha um {info.nome}?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{info.resumo}</p>

        {/* Número principal */}
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Salário médio no Brasil · {year}</p>
          <p className="mt-1 text-4xl font-black tracking-tight text-success">{moeda(info.media)}<span className="text-lg font-bold text-muted-foreground">/mês</span></p>
          {info.diaria && (
            <p className="mt-1 text-sm text-muted-foreground">Diária média: <strong className="text-foreground">{moeda(info.diaria)}</strong></p>
          )}

          <div className="mt-5 space-y-3">
            {[
              { label: "Piso (início de carreira)", valor: info.piso },
              { label: "Média nacional", valor: info.media },
              { label: "Teto (experientes)", valor: info.teto },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-bold">{moeda(f.valor)}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct(f.valor)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Estimativa de mercado para o Brasil — varia por cidade, porte da empresa e adicionais (noturno, insalubridade, horas extras).
          </p>
        </div>

        {/* Como ganhar mais */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <TrendingUp className="h-5 w-5 text-accent" /> O que aumenta o salário
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {fatores.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{f}
              </li>
            ))}
          </ul>
        </section>

        {/* Vagas reais abertas */}
        {vagas.length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <Briefcase className="h-5 w-5 text-primary" /> Vagas de {info.nome} abertas agora
            </h2>
            <ul className="mt-3 space-y-2">
              {vagas.map((v) => (
                <li key={v.id}>
                  <Link to="/vagas/$slug" params={{ slug: `${v.profissao_slug}-em-${v.cidade.toLowerCase().replace(/\s+/g, "-")}` }}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold leading-tight group-hover:text-primary">{v.titulo}</p>
                      <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{v.bairro}, {v.cidade}</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-success"><Wallet className="h-3 w-3" />{v.salario}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{v.horario}</span>
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section className="mt-6 rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-primary/10 p-6 text-center">
          <h2 className="text-xl font-black">Quer receber vagas de {info.nome}?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre seu currículo grátis em 1 minuto (pode gravar por áudio) e as empresas te chamam no WhatsApp.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link to="/cadastro" className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-pop">
              Criar currículo grátis
            </Link>
            <Link to="/vagas" search={{ q: info.nome }} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold">
              Ver todas as vagas
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-8">
          <h2 className="text-lg font-extrabold">Perguntas frequentes</h2>
          <div className="mt-3 space-y-2">
            {faq.map((f, i) => (
              <details key={i} className="group rounded-2xl border border-border bg-card p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold">
                  <span>{f.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-bold text-muted-foreground">Salários na área de {info.categoria}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {relacionados.map((r) => (
                <Link key={r.slug} to="/salarios/$slug" params={{ slug: r.slug }}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary">
                  {r.emoji} {r.nome} · {moeda(r.media)}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
