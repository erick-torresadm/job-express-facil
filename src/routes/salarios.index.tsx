import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, ArrowRight } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { listarSalarios } from "@/lib/salarios-data";

const YEAR = new Date().getFullYear();
const TITLE = `Tabela de salários ${YEAR} — quanto ganha cada profissão | VagasAgora`;
const DESC = `Salário médio, piso e teto de ${listarSalarios().length}+ profissões no Brasil em ${YEAR}: pedreiro, auxiliar de produção, motorista, cozinheiro, vendedor e mais. Dados atualizados do mercado de trabalho.`;

export const Route = createFileRoute("/salarios/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/salarios` },
      { property: "og:locale", content: "pt_BR" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/salarios` }],
  }),
  component: SalariosHub,
});

function moeda(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function SalariosHub() {
  const todos = listarSalarios();
  const categorias = [...new Set(todos.map((s) => s.categoria))];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
            <Wallet className="h-3 w-3" /> Guia de salários
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Quanto ganha cada profissão em {YEAR}?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Salário médio, piso e teto de {todos.length} profissões no Brasil — valores de mercado
            atualizados pra você negociar melhor e saber o que esperar antes de se candidatar.
          </p>
        </header>

        <div className="space-y-8">
          {categorias.map((cat) => (
            <section key={cat}>
              <h2 className="mb-3 text-lg font-extrabold">{cat}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {todos.filter((s) => s.categoria === cat).map((s) => (
                  <Link key={s.slug} to="/salarios/$slug" params={{ slug: s.slug }}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary">
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold group-hover:text-primary">{s.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        média <strong className="text-success">{moeda(s.media)}</strong> · até {moeda(s.teto)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 text-center shadow-soft">
          <h2 className="text-xl font-black">Achou seu valor? Agora ache sua vaga.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre seu currículo grátis por áudio em 1 minuto e receba propostas direto no WhatsApp.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link to="/cadastro" className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
              Criar currículo grátis
            </Link>
            <Link to="/vagas" className="inline-flex rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold">
              Ver vagas abertas
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
