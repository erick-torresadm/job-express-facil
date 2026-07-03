import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Clock, DollarSign, Flame, ArrowLeft, ChevronDown } from "lucide-react";
import { PROFISSOES, CIDADES } from "@/lib/mock-data";
import { SITE_URL } from "@/lib/site";
import { listarVagasPublicas, type VagaPublica } from "@/lib/vagas.functions";
import { calcularRotaCusto, calcularMatchScore } from "@/lib/intel.functions";
import { DistanciaCustoCard, MatchScoreBadge, FraudBadge } from "@/components/VagaCards";
import { VagaActions } from "@/components/VagaActions";
import { CriarAlertaCard } from "@/components/CriarAlertaCard";
import { AdSlot } from "@/components/AdSlot";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

// SEO-first dynamic page: any slug like "pedreiro-em-osasco" renders a populated page.
// Inspired by faceted search SEO: page exists for crawlers, content is generated on demand.

function parseSlug(slug: string) {
  const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const parts = clean.split("-em-");
  const profPart = (parts[0] ?? "vagas").replace(/-/g, " ");
  const locPart = (parts[1] ?? "").replace(/-/g, " ");
  const prof = PROFISSOES.find((p) => clean.includes(p.slug)) ?? null;
  const cidade = CIDADES.find((c) => locPart.includes(c.toLowerCase())) ?? (locPart ? capitalize(locPart) : "Brasil");
  const profissao = prof?.nome ?? capitalize(profPart);
  return { profissao, cidade, profSlug: prof?.slug ?? clean };
}
function capitalize(s: string) {
  return s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// FAQ estruturada (também alimenta JSON-LD FAQPage → resposta direta em Google e LLMs)
function buildFAQ(profissao: string, cidade: string) {
  const p = profissao.toLowerCase();
  return [
    {
      q: `Quanto ganha um ${p} em ${cidade}?`,
      a: `O salário médio de ${p} em ${cidade} varia entre R$ 1.500 e R$ 3.200 por mês, dependendo da experiência, do bairro e do tipo de contrato (CLT, PJ ou diária). Vagas com adicional noturno, insalubridade ou horas extras podem chegar a R$ 4.000. No VagasAgora você vê a faixa de mercado direto no anúncio.`,
    },
    {
      q: `Preciso ter experiência pra trabalhar de ${p} em ${cidade}?`,
      a: `Não necessariamente. Muitas vagas de ${p} em ${cidade} aceitam candidatos sem experiência formal, especialmente pra funções de ajudante ou auxiliar. Grave seu currículo em áudio contando o que já fez (mesmo informal) e a IA monta a apresentação pra você.`,
    },
    {
      q: `As vagas de ${p} em ${cidade} são CLT ou PJ?`,
      a: `Temos os dois formatos. A maioria das vagas operacionais em ${cidade} é CLT com carteira assinada, vale-transporte, VR e adicional. Também há vagas PJ, MEI, temporárias e por diária. O tipo de contrato aparece no cabeçalho de cada anúncio.`,
    },
    {
      q: `Como me candidato às vagas de ${p} em ${cidade}?`,
      a: `Cadastre-se grátis no VagasAgora (leva 1 minuto — pode gravar áudio ou vídeo). Depois é só apertar "Candidatar-me" na vaga que interessa. A empresa recebe seu currículo e chama você direto no WhatsApp. Sem taxa, sem intermediário.`,
    },
    {
      q: `Quais bairros de ${cidade} têm mais vagas de ${p}?`,
      a: `Em ${cidade}, os bairros que mais contratam ${p} costumam ser Centro, Zona Leste, Zona Sul e regiões próximas a estações de metrô/trem. No VagasAgora você filtra por bairro pra achar vaga perto de casa e ver o custo de transporte estimado.`,
    },
  ];
}

export const Route = createFileRoute("/vagas/$slug")({
  loader: async ({ params }) => {
    const { profissao, cidade, profSlug } = parseSlug(params.slug);
    const { vagas } = await listarVagasPublicas({ data: { profissaoSlug: profSlug, limit: 30 } });
    const count = vagas.length > 0 ? vagas.length : 0;
    return { profissao, cidade, vagas, count };
  },
  head: ({ params, loaderData }) => {
    const d = loaderData ?? { profissao: "Vagas", cidade: "Brasil", count: 0, vagas: [] as VagaPublica[] };
    const { profissao, cidade, count } = d;
    const year = new Date().getFullYear();
    const title = count > 0
      ? `${count} vagas de ${profissao} em ${cidade} — ${year} | VagasAgora`
      : `Vagas de ${profissao} em ${cidade} ${year} — Cadastre-se grátis | VagasAgora`;
    const description = count > 0
      ? `${count} vagas de ${profissao} abertas em ${cidade} agora. CLT, PJ, diária e meio período. Cadastre seu currículo grátis em 1 minuto por áudio e candidate-se direto pelo WhatsApp.`
      : `Vagas de ${profissao} em ${cidade}. Cadastre seu currículo grátis em 1 minuto por áudio e seja avisado assim que uma empresa publicar uma vaga na sua região.`;
    const canonical = `${SITE_URL}/vagas/${params.slug}`;

    const validThrough = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const jobPostings = d.vagas.map((v) => ({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: v.titulo,
      description: v.descricao
        ? v.descricao
        : `${v.titulo} na empresa ${v.empresa_nome}. Horário: ${v.horario}. Salário: ${v.salario}. Localização: ${v.bairro}, ${v.cidade}.`,
      identifier: {
        "@type": "PropertyValue",
        name: "VagasAgora",
        value: v.id,
      },
      datePosted: v.created_at,
      validThrough,
      employmentType: "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: v.empresa_nome,
        sameAs: SITE_URL,
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          streetAddress: v.endereco ?? undefined,
          addressLocality: v.cidade,
          addressRegion: "BR",
          addressCountry: "BR",
        },
      },
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "BRL",
        value: {
          "@type": "QuantitativeValue",
          value: v.salario,
          unitText: "MONTH",
        },
      },
      url: canonical,
      directApply: true,
    }));

    const faq = buildFAQ(profissao, cidade);

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { property: "og:locale", content: "pt_BR" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "keywords", content: `vagas ${profissao} ${cidade}, emprego ${profissao} ${cidade}, ${profissao} CLT ${cidade}, trabalho ${profissao} ${cidade}, vagas hoje ${cidade}, ${profissao} sem experiência` },
        { name: "geo.region", content: "BR" },
        { name: "geo.placename", content: cidade },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        ...jobPostings.map((jp) => ({
          type: "application/ld+json",
          children: JSON.stringify(jp),
        })),
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Vagas", item: `${SITE_URL}/categorias` },
              { "@type": "ListItem", position: 3, name: `${profissao} em ${cidade}`, item: canonical },
            ],
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
      ],
    };
  },
  component: VagasPage,
});

type FiltroTipo = "todos" | "urgente" | "recentes";

function VagasPage() {
  const data = Route.useLoaderData();
  const { profissao, cidade, vagas, count } = data ?? { profissao: "Vagas", cidade: "Brasil", vagas: [] as VagaPublica[], count: 0 };
  const [filtro, setFiltro] = useState<FiltroTipo>("todos");

  const vagasFiltradas = vagas.filter((v) => {
    if (filtro === "urgente") return v.urgente;
    if (filtro === "recentes") {
      const dia = 24 * 60 * 60 * 1000;
      return Date.now() - new Date(v.created_at).getTime() < 3 * dia;
    }
    return true;
  });

  const faq = buildFAQ(profissao, cidade);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <p className="text-sm font-bold">VagasAgora</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <nav aria-label="Breadcrumb" className="mb-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link> ·{" "}
          <Link to="/categorias" className="hover:text-foreground">Vagas</Link> ·{" "}
          <span className="text-foreground">{profissao} em {cidade}</span>
        </nav>

        <h1 className="text-3xl font-extrabold leading-tight">
          {count > 0 ? <>{count} vagas de <span className="text-accent">{profissao}</span> em {cidade}</> : <>Vagas de <span className="text-accent">{profissao}</span> em {cidade}</>}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {count > 0 ? "Atualizado agora. Candidate-se grátis em 1 toque." : "Ainda sem vagas abertas nesta busca. Cadastre seu currículo e seja avisado assim que uma empresa publicar."}
        </p>

        <Link to="/cadastro"
          className="btn-touch shadow-pop mt-5 flex w-full items-center justify-center bg-accent text-accent-foreground">
          🎤 Cadastrar meu currículo em 1 minuto
        </Link>

        <CriarAlertaCard profissao={profissao} cidade={cidade} />

        <AdSlot placement="vagas_lista_topo" format="banner" className="mt-6" />

        {vagas.length > 0 && (
          <>
            <div className="mt-8 mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Vagas em destaque</h2>
              <div className="flex gap-1 rounded-full bg-secondary p-1 text-xs font-bold">
                {(["todos", "urgente", "recentes"] as FiltroTipo[]).map((f) => (
                  <button key={f} onClick={() => setFiltro(f)}
                    className={`rounded-full px-3 py-1 transition ${filtro === f ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {f === "todos" ? "Todas" : f === "urgente" ? "🔥 Urgentes" : "🆕 Hoje"}
                  </button>
                ))}
              </div>
            </div>
            <ul className="space-y-3">
              {vagasFiltradas.map((v: VagaPublica) => (
                <li key={v.id} className="rounded-2xl border-2 border-border bg-card p-4 shadow-soft">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="font-extrabold leading-tight">{v.titulo}</h3>
                    <div className="flex shrink-0 gap-1.5">
                      <FraudBadge risco={v.risco_fraude} />
                      {v.urgente && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-1 text-[10px] font-extrabold uppercase text-destructive-foreground">
                          <Flame className="h-3 w-3" /> Urgente
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{v.empresa_nome}</p>
                  <div className="mt-3 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-3">
                    <span className="inline-flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-accent" /> {v.salario}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {v.horario}</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {v.bairro}</span>
                  </div>
                  {v.faixa_salarial_sugerida && (
                    <p className="mt-2 text-xs text-muted-foreground">Faixa de mercado: {v.faixa_salarial_sugerida}</p>
                  )}
                  <VagaDistancia vaga={v} />
                  <VagaActions vaga={v} />
                </li>
              ))}
              {vagasFiltradas.length === 0 && (
                <li className="rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  Nenhuma vaga com esse filtro. Tente outra opção.
                </li>
              )}
            </ul>
          </>
        )}

        {/* SEO section — texto único por profissão×cidade */}
        <section className="mt-10 rounded-3xl bg-secondary p-6">
          <h2 className="text-lg font-extrabold">Como funciona VagasAgora em {cidade}?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            VagasAgora conecta {profissao.toLowerCase()}s de {cidade} com empresas que estão contratando agora.
            Você grava um áudio de 1 minuto contando suas experiências, montamos seu currículo e empresas
            da região recebem seu perfil. Tudo grátis, direto do celular, sem precisar saber digitar.
          </p>
          <h3 className="mt-5 font-bold">Bairros com mais vagas em {cidade}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Centro", "Zona Leste", "Zona Sul", "Tatuapé", "Mooca", "Vila Mariana"].map((b) => (
              <Link key={b} to="/vagas/$slug" params={{ slug: `${profissao.toLowerCase().replace(/\s+/g, "-")}-em-${b.toLowerCase().replace(/\s+/g, "-")}` }}
                className="rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground">
                {profissao} em {b}
              </Link>
            ))}
          </div>
          <h3 className="mt-5 font-bold">Outras profissões em {cidade}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROFISSOES.slice(0, 8).map((p) => (
              <Link key={p.id} to="/vagas/$slug" params={{ slug: `${p.slug}-em-${cidade.toLowerCase().replace(/\s+/g, "-")}` }}
                className="rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground">
                {p.emoji} {p.nome}
              </Link>
            ))}
          </div>
          <h3 className="mt-5 font-bold">{profissao} em outras cidades</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {CIDADES.slice(0, 10).filter((c) => c !== cidade).map((c) => (
              <Link key={c} to="/vagas/$slug" params={{ slug: `${profissao.toLowerCase().replace(/\s+/g, "-")}-em-${c.toLowerCase().replace(/\s+/g, "-")}` }}
                className="rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground">
                {profissao} em {c}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ — renderiza o mesmo conteúdo do JSON-LD FAQPage */}
        <section className="mt-8">
          <h2 className="text-lg font-extrabold">Perguntas frequentes sobre vagas de {profissao} em {cidade}</h2>
          <div className="mt-3 space-y-2">
            {faq.map((f, i) => (
              <details key={i} className="group rounded-2xl border border-border bg-card p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-bold">
                  <span>{f.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function VagaDistancia({ vaga }: { vaga: VagaPublica }) {
  const { user } = useAuth();
  const [rota, setRota] = useState<{ km: number; minutosTransporte: number; custoMensal: number } | null>(null);
  const [match, setMatch] = useState<{ score: number; fatores: string[] } | null>(null);

  useEffect(() => {
    if (!user || vaga.latitude == null || vaga.longitude == null) return;
    (async () => {
      const { data: cv } = await supabase
        .from("curriculos")
        .select("latitude,longitude,cidade,bairro,profissao,habilidades,pretensao_salarial")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cv) return;

      let km: number | null = null;
      if (cv.latitude != null && cv.longitude != null) {
        try {
          const r = await calcularRotaCusto({
            data: {
              origemLat: cv.latitude, origemLng: cv.longitude,
              destinoLat: vaga.latitude!, destinoLng: vaga.longitude!,
              cidade: vaga.cidade,
            },
          });
          setRota({ km: r.km, minutosTransporte: r.minutosTransporte, custoMensal: r.custoMensal });
          km = r.km;
        } catch { /* ignora */ }
      }

      const habs = Array.isArray(cv.habilidades) ? (cv.habilidades as unknown[]).map(String) : [];
      const m = calcularMatchScore({
        candidato: { profissao: cv.profissao, cidade: cv.cidade, bairro: cv.bairro, habilidades: habs, pretensao_salarial: cv.pretensao_salarial },
        vaga: { profissao: vaga.profissao, cidade: vaga.cidade, bairro: vaga.bairro, salario: vaga.salario, requisitos: vaga.requisitos },
        kmDistancia: km,
      });
      setMatch(m);
    })();
  }, [user, vaga]);

  if (!user) return null;
  return (
    <div className="mt-3 space-y-2">
      {match && <MatchScoreBadge score={match.score} fatores={match.fatores} />}
      {rota && (
        <DistanciaCustoCard
          km={rota.km}
          minutosTransporte={rota.minutosTransporte}
          custoTransporteMes={rota.custoMensal}
          custoAlimentacaoMes={vaga.custo_alimentacao_mes}
        />
      )}
    </div>
  );
}
