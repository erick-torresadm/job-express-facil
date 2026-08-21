import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Clock, DollarSign, Flame, ChevronDown, Sparkles, Building2, ListChecks } from "lucide-react";
import { PROFISSOES, CIDADES } from "@/lib/mock-data";
import { SITE_URL } from "@/lib/site";
import { listarVagasPublicas, type VagaPublica } from "@/lib/vagas.functions";
import { getSalarioInfo } from "@/lib/salarios-data";
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
  const cidadeMatch = CIDADES.find((c) => locPart.includes(c.toLowerCase())) ?? null;
  const cidade = cidadeMatch ?? (locPart ? capitalize(locPart) : "Brasil");
  const profissao = prof?.nome ?? capitalize(profPart);
  // Reconhecido = achou profissão OU cidade de verdade no catálogo. Slug com
  // as duas partes desconhecidas é lixo (typo, URL antiga do Lovable etc.) —
  // não deve virar página 200 (soft-404 confunde o Google).
  const reconhecido = !!prof || !!cidadeMatch;
  return { profissao, cidade, profSlug: prof?.slug ?? clean, reconhecido };
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
    const { profissao, cidade, profSlug, reconhecido } = parseSlug(params.slug);
    if (!reconhecido) throw notFound();
    const { vagas } = await listarVagasPublicas({ data: { profissaoSlug: profSlug, limit: 30 } });
    const count = vagas.length > 0 ? vagas.length : 0;
    return { profissao, cidade, vagas, count, profSlug };
  },
  head: ({ params, loaderData }) => {
    const d = loaderData ?? { profissao: "Vagas", cidade: "Brasil", count: 0, vagas: [] as VagaPublica[] };
    const { profissao, cidade, count } = d;
    const robots = count > 0 ? "index, follow" : "noindex, follow";
    const year = new Date().getFullYear();
    const title = count > 0
      ? `${count} vagas de ${profissao} em ${cidade} — ${year} | VagasAgora`
      : `Vagas de ${profissao} em ${cidade} ${year} — Cadastre-se grátis | VagasAgora`;
    const description = count > 0
      ? `${count} vagas de ${profissao} abertas em ${cidade} agora. CLT, PJ, diária e meio período. Cadastre seu currículo grátis em 1 minuto por áudio e candidate-se direto pelo WhatsApp.`
      : `Vagas de ${profissao} em ${cidade}. Cadastre seu currículo grátis em 1 minuto por áudio e seja avisado assim que uma empresa publicar uma vaga na sua região.`;
    const canonical = `${SITE_URL}/vagas/${params.slug}`;

    const validThrough = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Helper: Parse salary string (e.g., "1500-2500" or "1500" or "R$ 1500") to extract first number
    const parseSalary = (salarioStr: string): number | null => {
      if (!salarioStr) return null;
      const match = salarioStr.match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    };

    // Helper: Map regime to Google JobPosting employmentType
    const getEmploymentType = (regime: string): string => {
      const regimeMap: Record<string, string> = {
        clt: "FULL_TIME",
        pj: "CONTRACTOR",
        estagio: "INTERN",
        outros: "OTHER",
      };
      return regimeMap[regime.toLowerCase()] || "FULL_TIME";
    };

    // Esta página é uma listagem faceada (profissão × cidade), não a página de
    // uma vaga específica — não existe URL única por vaga no site ainda. Emitir
    // um JobPosting por vaga aqui violaria as diretrizes do Google (todas
    // apontariam pra mesma URL canônica), então publicamos só a mais relevante
    // como representativa da página.
    const jobPostings = d.vagas.slice(0, 1).map((v) => {
      const baseSalaryValue = parseSalary(v.salario);

      return {
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
        employmentType: getEmploymentType(v.regime),
        jobTitle: v.titulo,
        hiringOrganization: {
          "@type": "Organization",
          name: v.empresa_nome,
          // Página personalizada da empresa quando ela tem uma configurada
          // (toda vaga que ela publica aparece lá automaticamente) — só cai
          // pro site genérico se ela ainda não criou a própria página.
          url: v.empresa_slug_publico ? `${SITE_URL}/c/${v.empresa_slug_publico}` : SITE_URL,
          ...(v.empresa_logo_url && { logo: v.empresa_logo_url }),
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            streetAddress: v.endereco ?? v.bairro ?? undefined,
            addressLocality: v.cidade,
            addressCountry: "BR",
          },
          // Coordenadas reais (já geocodificadas na criação da vaga) dão ao
          // Google mais precisão pra casar a vaga com buscas "perto de mim"
          // de cidades vizinhas — o schema não tem campo de raio, quem decide
          // isso é o algoritmo de proximidade do próprio Google, e ele
          // funciona melhor com lat/long do que só texto de endereço.
          ...(v.latitude != null && v.longitude != null && {
            geo: {
              "@type": "GeoCoordinates",
              latitude: v.latitude,
              longitude: v.longitude,
            },
          }),
        },
        ...(baseSalaryValue && {
          baseSalary: {
            "@type": "PriceSpecification",
            currency: "BRL",
            value: {
              "@type": "QuantitativeValue",
              value: baseSalaryValue,
              unitText: "MONTH",
            },
          },
        }),
        url: canonical,
        directApply: true,
      };
    });

    const faq = buildFAQ(profissao, cidade);

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: robots },
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
  const { profissao, cidade, vagas, count, profSlug } = data ?? { profissao: "Vagas", cidade: "Brasil", vagas: [] as VagaPublica[], count: 0, profSlug: "" };
  const salarioInfo = profSlug ? getSalarioInfo(profSlug) : null;
  const [filtro, setFiltro] = useState<FiltroTipo>("todos");

  const vagasFiltradas = vagas.filter((v: VagaPublica) => {
    if (filtro === "urgente") return v.urgente;
    if (filtro === "recentes") {
      const dia = 24 * 60 * 60 * 1000;
      return Date.now() - new Date(v.created_at).getTime() < 3 * dia;
    }
    return true;
  });

  const faq = buildFAQ(profissao, cidade);

  const vagaPrincipal = vagas[0];

  return (
    <div className="min-h-screen bg-background">
      <main className={`mx-auto max-w-2xl px-4 py-6 ${vagaPrincipal ? "pb-24 lg:pb-6" : ""}`}>
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

        <div className="mt-6">
          <AdSlot placement="vagas_lista_topo" format="banner" />
        </div>

        {vagas.length > 0 && (
          <>
            {vagas.length > 1 && (
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
            )}
            <ul className={`space-y-3 ${vagas.length === 1 ? "mt-6" : ""}`}>
              {vagasFiltradas.map((v: VagaPublica) => (
                <li key={v.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:border-accent/40">
                  <div className="flex gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground overflow-hidden">
                      {v.empresa_logo_url ? (
                        <img src={v.empresa_logo_url} alt={v.empresa_nome} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold leading-tight">{v.titulo}</h3>
                        {v.urgente && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive px-2 py-1 text-[10px] font-extrabold uppercase text-destructive-foreground">
                            <Flame className="h-3 w-3" /> Urgente
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {v.empresa_slug_publico ? (
                          <Link to="/c/$slug" params={{ slug: v.empresa_slug_publico }} className="hover:text-foreground hover:underline">
                            {v.empresa_nome}
                          </Link>
                        ) : v.empresa_nome} · {v.bairro}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-success">
                      <DollarSign className="h-3.5 w-3.5" /> {v.salario}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {v.horario}
                    </span>
                    <FraudBadge risco={v.risco_fraude} />
                  </div>

                  {v.descricao && (
                    <p className={`mt-3 text-sm text-muted-foreground ${vagas.length > 1 ? "line-clamp-2" : "whitespace-pre-line"}`}>
                      {v.descricao}
                    </p>
                  )}

                  {v.requisitos.length > 0 && (
                    <div className="mt-3">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        <ListChecks className="h-3.5 w-3.5" /> Requisitos
                      </p>
                      <ul className="mt-1 space-y-0.5 text-sm text-foreground">
                        {v.requisitos.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(v.endereco || v.bairro) && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {v.endereco || `${v.bairro}, ${v.cidade}`}
                    </p>
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

        {/* Guia de salário da profissão — link cruzado com /salarios */}
        {salarioInfo && (
          <Link to="/salarios/$slug" params={{ slug: salarioInfo.slug }}
            className="group mt-8 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary">
            <div>
              <p className="text-sm font-bold group-hover:text-primary">Quanto ganha um {salarioInfo.nome}?</p>
              <p className="text-xs text-muted-foreground">
                Média nacional, piso, teto e o que faz o salário subir — guia completo {new Date().getFullYear()}.
              </p>
            </div>
            <span className="shrink-0 text-xs font-bold text-primary">Ver guia →</span>
          </Link>
        )}

        {/* Conteúdo de apoio (SEO) — deliberadamente discreto, abaixo das vagas de verdade */}
        <section className="mt-10 rounded-2xl border border-border bg-secondary/40 p-5">
          <p className="text-xs text-muted-foreground">
            VagasAgora conecta {profissao.toLowerCase()}s de {cidade} com empresas que estão contratando agora.
            Grave um áudio de 1 minuto contando suas experiências e monte seu currículo grátis, direto do celular.
          </p>
          <details className="group mt-3">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-bold text-muted-foreground">
              Ver mais bairros e cidades <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground">Bairros com mais vagas em {cidade}</h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {["Centro", "Zona Leste", "Zona Sul", "Tatuapé", "Mooca", "Vila Mariana"].map((b) => (
                    <Link key={b} to="/vagas/$slug" params={{ slug: `${profissao.toLowerCase().replace(/\s+/g, "-")}-em-${b.toLowerCase().replace(/\s+/g, "-")}` }}
                      className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent hover:text-accent-foreground">
                      {profissao} em {b}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-muted-foreground">Outras profissões em {cidade}</h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {PROFISSOES.slice(0, 8).map((p) => (
                    <Link key={p.id} to="/vagas/$slug" params={{ slug: `${p.slug}-em-${cidade.toLowerCase().replace(/\s+/g, "-")}` }}
                      className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent hover:text-accent-foreground">
                      {p.emoji} {p.nome}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-muted-foreground">{profissao} em outras cidades</h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {CIDADES.slice(0, 10).filter((c) => c !== cidade).map((c) => (
                    <Link key={c} to="/vagas/$slug" params={{ slug: `${profissao.toLowerCase().replace(/\s+/g, "-")}-em-${c.toLowerCase().replace(/\s+/g, "-")}` }}
                      className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent hover:text-accent-foreground">
                      {profissao} em {c}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </section>

        {/* FAQ — mesmo conteúdo do JSON-LD FAQPage, colapsado por padrão */}
        <section className="mt-4">
          <details className="group rounded-2xl border border-border bg-card p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold text-muted-foreground">
              Perguntas frequentes sobre vagas de {profissao} em {cidade}
              <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <div className="mt-3 space-y-2">
              {faq.map((f, i) => (
                <details key={i} className="group/item rounded-xl border border-border bg-secondary/30 p-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold">
                    <span>{f.q}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition group-open/item:rotate-180" />
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </details>
        </section>
      </main>

      {vagaPrincipal && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-3 shadow-pop backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-tight">{vagaPrincipal.titulo}</p>
              <p className="truncate text-xs font-semibold text-success">{vagaPrincipal.salario}</p>
            </div>
            <VagaActions vaga={vagaPrincipal} compact />
          </div>
        </div>
      )}
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

  if (!user || (!match && !rota)) return null;
  return (
    <details className="group mt-3 rounded-xl border border-border bg-secondary/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-bold text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          {match ? `Match ${match.score}% com seu perfil` : "Ver distância e custo até a vaga"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 transition group-open:rotate-180" />
      </summary>
      <div className="space-y-2 px-3 pb-3">
        <p className="text-[11px] text-muted-foreground">
          Compatibilidade estimada com seu perfil — é só uma dica, não afeta sua candidatura.
        </p>
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
    </details>
  );
}
