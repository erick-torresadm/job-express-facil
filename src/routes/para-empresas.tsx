import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Building2, Zap, Users } from "lucide-react";

export const Route = createFileRoute("/para-empresas")({
  head: () => ({
    meta: [
      { title: "Para empresas — Contrate trabalhadores qualificados perto da obra" },
      { name: "description", content: "Encontre pedreiros, ajudantes, motoristas e domésticas no bairro da sua obra. Desbloqueio por candidato a partir de R$ 19." },
    ],
  }),
  component: ParaEmpresas,
});

const planos = [
  {
    nome: "Avulso",
    preco: "R$ 19",
    sub: "por contato desbloqueado",
    items: ["Acesso a perfis do bairro", "WhatsApp do candidato", "Sem mensalidade"],
    cta: "Começar grátis",
    variant: "outline" as const,
  },
  {
    nome: "Construtora",
    preco: "R$ 299",
    sub: "/mês · 30 desbloqueios",
    items: ["Tudo do Avulso", "Vagas destacadas grátis", "Filtros por bairro e experiência", "Suporte WhatsApp"],
    cta: "Assinar Construtora",
    variant: "primary" as const,
    badge: "MAIS POPULAR",
  },
  {
    nome: "Volume",
    preco: "Sob consulta",
    sub: "para 100+ contratações/mês",
    items: ["API de candidatos", "Integração com seu ERP", "Account manager", "SLA dedicado"],
    cta: "Falar com vendas",
    variant: "outline" as const,
  },
];

function ParaEmpresas() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <Building2 className="h-3.5 w-3.5" /> Para RH e empresas
        </span>
        <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">Contrate quem mora perto da sua obra</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Candidatos reais do bairro, com áudio e vídeo do próprio trabalhador. Sem agência, sem fila de currículos genéricos.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Stat icon={<Users className="h-5 w-5" />} v="12.480" l="candidatos ativos" />
        <Stat icon={<Zap className="h-5 w-5" />} v="< 2h" l="tempo médio até 1ª resposta" />
        <Stat icon={<Check className="h-5 w-5" />} v="93%" l="comparecem na entrevista" />
      </div>

      <h2 className="mt-12 text-2xl font-extrabold">Planos</h2>
      <p className="text-sm text-muted-foreground">Pague só quando contratar. Sem fidelidade.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {planos.map((p) => (
          <div key={p.nome} className={`relative rounded-3xl border-2 p-6 shadow-soft ${p.variant === "primary" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
            {p.badge && (
              <span className="absolute -top-2 right-4 rounded-full bg-warning px-3 py-1 text-[10px] font-extrabold text-warning-foreground">{p.badge}</span>
            )}
            <h3 className="text-lg font-extrabold">{p.nome}</h3>
            <p className="mt-2 text-3xl font-extrabold">{p.preco}</p>
            <p className={`text-xs ${p.variant === "primary" ? "opacity-80" : "text-muted-foreground"}`}>{p.sub}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {p.items.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" /> {i}
                </li>
              ))}
            </ul>
            <Link to="/empresa" className={`btn-touch mt-5 flex w-full items-center justify-center ${p.variant === "primary" ? "bg-accent text-accent-foreground" : "border-2 border-border bg-card"}`}>
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon, v, l }: { icon: React.ReactNode; v: string; l: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-xs font-semibold uppercase">{l}</span></div>
      <p className="mt-1 text-3xl font-extrabold">{v}</p>
    </div>
  );
}
