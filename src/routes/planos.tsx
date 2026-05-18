import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos para empresas — VagasAgora" },
      { name: "description", content: "R$99/mês no plano Básico ou R$299/mês no Full. Pague anual e economize 20%. Comece grátis com 10 contatos liberados." },
      { property: "og:title", content: "Planos para empresas — VagasAgora" },
      { property: "og:description", content: "10 contatos grátis. Depois R$99/mês ou R$299/mês. Desconto no anual." },
    ],
  }),
  component: PlanosPage,
});

const DESCONTO_ANUAL = 0.2; // 20% off

function PlanosPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-extrabold">VagasAgora</Link>
          <Link to="/empresa" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Sou empresa</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12 text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent-foreground">
          <Sparkles className="h-3 w-3" /> 10 contatos grátis para começar
        </span>
        <h1 className="mt-4 text-4xl font-extrabold lg:text-5xl">Contrate sem perder tempo</h1>
        <p className="mt-3 text-muted-foreground">Cobre só por candidato que você quiser falar. Cancele quando quiser.</p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-16 lg:grid-cols-3">
        <PlanoCard
          nome="Free"
          preco="R$ 0"
          subtitulo="Para experimentar"
          features={["10 contatos liberados", "Acesso a todos os currículos", "1 vaga ativa", "Suporte por e-mail"]}
          cta="Começar grátis" to="/auth"
        />
        <PlanoCard
          nome="Básico"
          preco="R$ 99"
          subtitulo="por mês"
          precoAnual={Math.round(99 * 12 * (1 - DESCONTO_ANUAL))}
          destaque
          features={[
            "100 contatos liberados/mês",
            "5 vagas ativas simultâneas",
            "Página personalizada (logo + cor)",
            "Notificações de novos candidatos",
            "Filtros por bairro e profissão",
          ]}
          cta="Assinar Básico" to="/auth"
        />
        <PlanoCard
          nome="Full"
          preco="R$ 299"
          subtitulo="por mês"
          precoAnual={Math.round(299 * 12 * (1 - DESCONTO_ANUAL))}
          features={[
            "Contatos ilimitados",
            "Vagas ilimitadas",
            "Perguntas extras no formulário",
            "Match automático por IA",
            "Detecção de fraude e salário sugerido",
            "Suporte prioritário",
          ]}
          cta="Assinar Full" to="/auth"
        />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 text-center">
        <p className="text-sm text-muted-foreground">
          Pagando anual: <strong className="text-foreground">20% de desconto</strong> nos planos pagos.
          Sem fidelidade. Cancele a hora que quiser.
        </p>
      </section>
    </div>
  );
}

function PlanoCard({ nome, preco, subtitulo, features, cta, to, destaque, precoAnual }: {
  nome: string; preco: string; subtitulo: string;
  features: string[]; cta: string; to: string; destaque?: boolean; precoAnual?: number;
}) {
  return (
    <article className={`relative rounded-3xl border bg-card p-6 ${destaque ? "border-primary shadow-lg ring-2 ring-primary/30" : "border-border"}`}>
      {destaque && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-extrabold uppercase text-primary-foreground">
          Mais popular
        </span>
      )}
      <h3 className="text-xl font-extrabold">{nome}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold">{preco}</span>
        <span className="text-sm text-muted-foreground">{subtitulo}</span>
      </div>
      {precoAnual && (
        <p className="mt-1 text-xs text-accent">ou R$ {precoAnual.toLocaleString("pt-BR")}/ano (20% off)</p>
      )}
      <ul className="mt-6 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {f}
          </li>
        ))}
      </ul>
      <Link to={to} className={`mt-6 inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold ${destaque ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent/20"}`}>
        {cta}
      </Link>
    </article>
  );
}
