import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ExternalLink, ArrowRight, MessageSquare, Briefcase, Star } from "lucide-react";
import { getMeuFreelancer, listMeusProjetos, listMeusOrcamentos } from "@/lib/freelas.functions";

export const Route = createFileRoute("/freelancer/")({
  component: FreelancerHome,
});

function FreelancerHome() {
  const { data: freela, isLoading } = useQuery({
    queryKey: ["meu-freelancer"],
    queryFn: () => getMeuFreelancer(),
  });
  const { data: projetos = [] } = useQuery({
    queryKey: ["meus-projetos"],
    queryFn: () => listMeusProjetos(),
    enabled: !!freela,
  });
  const { data: orcamentos = [] } = useQuery({
    queryKey: ["meus-orcamentos"],
    queryFn: () => listMeusOrcamentos(),
    enabled: !!freela,
  });

  if (isLoading) return <p className="text-muted-foreground">Carregando…</p>;

  if (!freela) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground shadow-pop">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" /> Novidade
        </span>
        <h1 className="mt-3 font-display text-3xl font-black">Crie sua vitrine de freelancer</h1>
        <p className="mt-2 max-w-lg text-primary-foreground/90">
          Publique seu portfólio, receba pedidos de orçamento e feche projetos direto no WhatsApp.
          <strong> Grátis por 2 anos</strong> durante a promoção de lançamento.
        </p>
        <Link
          to="/freelancer/perfil"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary hover:scale-[1.02] transition"
        >
          Criar meu perfil <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const novos = orcamentos.filter((o) => o.status === "novo").length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Sua vitrine pública</p>
            <h1 className="font-display text-xl font-bold">@{freela.handle}</h1>
          </div>
          <Link
            to="/freelas/p/$handle"
            params={{ handle: freela.handle }}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
          >
            Ver perfil público <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card icon={MessageSquare} label="Orçamentos novos" value={novos} to="/freelancer/orcamentos" />
        <Card icon={Briefcase} label="Projetos publicados" value={projetos.filter((p) => p.publicado).length} to="/freelancer/portfolio" />
        <Card icon={Star} label="Visualizações" value={freela.views ?? 0} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-2 font-display text-lg font-bold">Aumente suas chances</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Adicione pelo menos 3 projetos com fotos boas</li>
          <li>✓ Peça avaliação para clientes anteriores</li>
          <li>✓ Complete headline, bio e valor/hora</li>
          <li>✓ Compartilhe seu link <code className="rounded bg-secondary px-1">/freelas/p/{freela.handle}</code> no LinkedIn e Instagram</li>
        </ul>
      </section>
    </div>
  );
}

function Card({ icon: Icon, label, value, to }: { icon: any; label: string; value: number; to?: string }) {
  const inner = (
    <div className="rounded-2xl border border-border bg-card p-5 transition hover:border-accent">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-black">{value}</p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}
