import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Printer, Share2, MessageCircle, MapPin, Briefcase, Check, ArrowLeft, Copy, Lock, Linkedin } from "lucide-react";
import { getCurriculoPublico } from "@/lib/curriculo.functions";

type Curriculo = {
  slug: string;
  nome: string;
  profissao: string;
  bairro: string | null;
  cidade: string | null;
  resumo: string;
  experiencias: string[];
  habilidades: string[];
  dicas: string[];
  tem_audio: boolean;
  tem_video: boolean;
  duracao_segundos: number;
  linkedin_url: string | null;
  created_at: string;
};

export const Route = createFileRoute("/cv/$slug")({
  loader: async ({ params }) => {
    const data = await getCurriculoPublico({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data as Curriculo;
  },
  head: ({ loaderData }) => {
    const cv = loaderData;
    const title = cv ? `${cv.nome} — ${cv.profissao} | Currículo VagasAgora` : "Currículo";
    const desc = cv?.resumo ?? "Currículo profissional gerado no VagasAgora.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  component: CurriculoPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-extrabold">Currículo não encontrado</h1>
      <p className="mt-2 text-muted-foreground">O link pode estar errado ou o currículo foi removido.</p>
      <Link to="/cadastro" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
        Criar meu currículo
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-xl font-bold">Erro ao carregar currículo</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});


function CurriculoPage() {
  const cv = Route.useLoaderData() as Curriculo;
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Veja o currículo de ${cv.nome} (${cv.profissao}) no VagasAgora: ${url}`;

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: `Currículo — ${cv.nome}`, text: shareText, url }); return; } catch { /* canceled */ }
    }
    copy();
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* */ }
  };
  const print = () => window.print();
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white">
      {/* Action bar (hidden on print) */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <div className="flex flex-wrap gap-2">
            <button onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted">
              {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado!" : "Copiar link"}
            </button>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-2 text-xs font-bold text-white shadow-pop">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <button onClick={share}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground">
              <Share2 className="h-4 w-4" /> Compartilhar
            </button>
            <button onClick={print}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-pop">
              <Printer className="h-4 w-4" /> Baixar PDF
            </button>
          </div>
        </div>
      </div>

      {/* CV document */}
      <main className="mx-auto max-w-3xl px-4 py-8 print:p-0">
        <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft print:rounded-none print:border-0 print:shadow-none">
          {/* Header */}
          <header className="bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground print:bg-primary print:text-white">
            <div className="flex items-start gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-background/20 text-3xl font-extrabold backdrop-blur">
                {cv.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold leading-tight">{cv.nome}</h1>
                <p className="mt-1 inline-flex items-center gap-1.5 text-base font-semibold opacity-95">
                  <Briefcase className="h-4 w-4" /> {cv.profissao}
                </p>
                {(cv.bairro || cv.cidade) && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm opacity-90">
                    <MapPin className="h-4 w-4" /> {[cv.bairro, cv.cidade].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-5 border-t border-background/20 pt-4 text-base leading-relaxed opacity-95">
              {cv.resumo}
            </p>
          </header>

          {/* Contato protegido — só empresas verificadas após revelar */}
          <section className="border-b border-border bg-muted/40 px-8 py-5 print:bg-white">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-bold text-foreground">Contato protegido</p>
                <p className="mt-1 text-muted-foreground">WhatsApp e e-mail aparecem apenas para empresas após revelar o contato pelo painel.</p>
              </div>
            </div>
          </section>

          {/* Body */}
          <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-primary">Experiências</h2>
              <ul className="space-y-2.5">
                {cv.experiencias.map((e, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>

              {(cv.tem_audio || cv.tem_video) && (
                <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/5 p-4 print:hidden">
                  <p className="text-xs font-bold uppercase text-accent">Apresentação em {cv.tem_video ? "vídeo" : "áudio"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    O candidato gravou {cv.duracao_segundos}s de apresentação pessoal. Disponível para empresas no VagasAgora.
                  </p>
                </div>
              )}
            </div>

            <aside>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-primary">Habilidades</h2>
              <div className="flex flex-wrap gap-1.5">
                {cv.habilidades.map((h, i) => (
                  <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {h}
                  </span>
                ))}
              </div>
            </aside>
          </div>

          <footer className="border-t border-border px-8 py-4 text-center text-xs text-muted-foreground">
            Currículo gerado em <strong>VagasAgora</strong> · vagasagora.com.br
          </footer>
        </article>

        <p className="mt-6 text-center text-xs text-muted-foreground print:hidden">
          Link público: <span className="font-mono">{url}</span>
        </p>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
