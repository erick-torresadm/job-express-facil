import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Clock, DollarSign, Flame, ArrowLeft } from "lucide-react";
import { PROFISSOES, CIDADES } from "@/lib/mock-data";
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
    const title = count > 0
      ? `${count} vagas de ${profissao} em ${cidade} hoje — VagasAgora`
      : `Vagas de ${profissao} em ${cidade} — Cadastre-se grátis | VagasAgora`;
    const description = count > 0
      ? `${count} vagas de ${profissao} abertas em ${cidade} agora. CLT, PJ e meio período. Cadastre seu currículo grátis em 1 minuto por áudio e candidate-se direto pelo WhatsApp.`
      : `Vagas de ${profissao} em ${cidade}. Cadastre seu currículo grátis em 1 minuto por áudio e seja avisado assim que uma empresa publicar uma vaga.`;
    const canonical = `https://vagasagora.com.br/vagas/${params.slug}`;

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
        sameAs: "https://vagasagora.com.br",
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

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "keywords", content: `vagas ${profissao}, emprego ${profissao} ${cidade}, vagas em ${cidade}, ${profissao} CLT, trabalho ${profissao}` },
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
              { "@type": "ListItem", position: 1, name: "Home", item: "https://vagasagora.com.br/" },
              { "@type": "ListItem", position: 2, name: "Vagas", item: "https://vagasagora.com.br/categorias" },
              { "@type": "ListItem", position: 3, name: `${profissao} em ${cidade}`, item: canonical },
            ],
          }),
        },
      ],
    };
  },
  component: VagasPage,
});


function VagasPage() {
  const data = Route.useLoaderData();
  const { profissao, cidade, vagas, count } = data ?? { profissao: "Vagas", cidade: "Brasil", vagas: [] as VagaPublica[], count: 0 };

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
            <h2 className="mt-8 mb-3 text-lg font-bold">Vagas em destaque</h2>
            <ul className="space-y-3">
              {vagas.map((v: VagaPublica) => (
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
            </ul>
          </>
        )}
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
            {PROFISSOES.slice(0, 6).map((p) => (
              <Link key={p.id} to="/vagas/$slug" params={{ slug: `${p.slug}-em-${cidade.toLowerCase().replace(/\s+/g, "-")}` }}
                className="rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground">
                {p.emoji} {p.nome}
              </Link>
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
