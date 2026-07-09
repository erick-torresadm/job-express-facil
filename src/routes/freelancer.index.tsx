import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  ExternalLink,
  ArrowRight,
  MessageSquare,
  Briefcase,
  Star,
  Eye,
  Copy,
  Share2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  getMeuFreelancer,
  listMeusProjetos,
  listMeusOrcamentos,
  listMinhasAvaliacoes,
} from "@/lib/freelas.functions";

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
  const { data: avaliacoes = [] } = useQuery({
    queryKey: ["minhas-avaliacoes"],
    queryFn: () => listMinhasAvaliacoes(),
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
          <strong> Grátis</strong> — sem taxas, sem comissão.
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

  const novos = orcamentos.filter((o: any) => o.status === "novo").length;
  const notaMedia =
    avaliacoes.length > 0
      ? avaliacoes.reduce((s: number, a: any) => s + (a.nota ?? 0), 0) / avaliacoes.length
      : null;
  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/freelas/p/${freela.handle}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: freela.nome, url: publicUrl });
      } catch {}
    } else {
      copyLink();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header do painel */}
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-5 md:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-card bg-primary/10 text-lg font-black text-primary shadow-soft">
              {freela.avatar_url ? (
                <img src={freela.avatar_url} alt={freela.nome} className="h-full w-full object-cover" />
              ) : (
                freela.nome.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Bem-vindo de volta
              </p>
              <h1 className="truncate font-display text-xl font-black md:text-2xl">
                Olá, {freela.nome.split(" ")[0]}!
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                Vitrine pública: <span className="font-mono">@{freela.handle}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/freelas/p/$handle"
              params={{ handle: freela.handle }}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:scale-[1.02] transition"
            >
              Ver vitrine <ExternalLink className="h-3 w-3" />
            </Link>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-bold hover:border-accent"
            >
              <Copy className="h-3 w-3" /> Copiar link
            </button>
            <button
              onClick={share}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-bold hover:border-accent"
            >
              <Share2 className="h-3 w-3" /> Compartilhar
            </button>
          </div>
        </div>
      </section>

      {/* Métricas */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card icon={MessageSquare} label="Orçamentos novos" value={novos} accent to="/freelancer/orcamentos" />
        <Card icon={Briefcase} label="Projetos publicados" value={projetos.filter((p: any) => p.publicado).length} to="/freelancer/portfolio" />
        <Card icon={Star} label="Nota média" value={notaMedia != null ? notaMedia.toFixed(1) : "—"} suffix={avaliacoes.length ? `(${avaliacoes.length})` : ""} />
        <Card icon={Eye} label="Visualizações" value={freela.views ?? 0} />
      </div>

      {/* Colunas: últimos orçamentos + últimas avaliações */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-black">Últimos orçamentos</h2>
            <Link to="/freelancer/orcamentos" className="text-xs font-bold text-accent hover:underline">
              Ver todos →
            </Link>
          </div>
          {orcamentos.length === 0 ? (
            <EmptyMini icon={MessageSquare} text="Nenhum pedido ainda. Compartilhe seu link para atrair clientes." />
          ) : (
            <ul className="space-y-2">
              {orcamentos.slice(0, 4).map((o: any) => (
                <li key={o.id} className="rounded-2xl border border-border/60 bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-bold">{o.nome}</p>
                    <StatusPill status={o.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{o.descricao}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-black">Avaliações recentes</h2>
            {notaMedia != null && (
              <span className="inline-flex items-center gap-1 text-xs font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {notaMedia.toFixed(1)}
              </span>
            )}
          </div>
          {avaliacoes.length === 0 ? (
            <EmptyMini icon={Star} text="Ainda sem avaliações. Peça para clientes anteriores deixarem um depoimento." />
          ) : (
            <ul className="space-y-2">
              {avaliacoes.slice(0, 4).map((a: any) => (
                <li key={a.id} className="rounded-2xl border border-border/60 bg-background p-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < a.nota ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`}
                      />
                    ))}
                    {!a.aprovada && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-800">
                        <Clock className="h-2.5 w-2.5" /> em análise
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs">{a.comentario}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    — {a.autor_nome}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Checklist de crescimento */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="mb-3 font-display text-lg font-black">Turbine seu perfil</h2>
        <ul className="grid gap-2 text-sm md:grid-cols-2">
          <ChecklistItem done={!!freela.avatar_url} label="Adicionar foto de perfil" />
          <ChecklistItem done={!!freela.headline && freela.headline.length > 10} label="Escrever headline forte" />
          <ChecklistItem done={!!freela.bio && freela.bio.length > 40} label="Preencher bio" />
          <ChecklistItem done={projetos.length >= 3} label="Publicar ao menos 3 projetos" />
          <ChecklistItem done={!!freela.whatsapp} label="Cadastrar WhatsApp" />
          <ChecklistItem done={avaliacoes.length > 0} label="Receber a 1ª avaliação" />
        </ul>
      </section>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
  to,
  accent,
  suffix,
}: {
  icon: any;
  label: string;
  value: number | string;
  to?: string;
  accent?: boolean;
  suffix?: string;
}) {
  const inner = (
    <div
      className={`rounded-2xl border p-4 transition ${
        accent
          ? "border-accent/50 bg-accent/5 hover:border-accent"
          : "border-border bg-card hover:border-accent"
      }`}
    >
      <Icon className={`h-5 w-5 ${accent ? "text-accent" : "text-primary"}`} />
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-black md:text-3xl">
        {value}
        {suffix && <span className="ml-1 text-xs font-normal text-muted-foreground">{suffix}</span>}
      </p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    novo: { label: "Novo", className: "bg-emerald-100 text-emerald-800" },
    respondido: { label: "Respondido", className: "bg-sky-100 text-sky-800" },
    fechado: { label: "Fechado", className: "bg-primary/15 text-primary" },
    perdido: { label: "Perdido", className: "bg-muted text-muted-foreground" },
  };
  const s = map[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s.className}`}>
      {s.label}
    </span>
  );
}

function EmptyMini({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-6 text-center">
      <Icon className="mx-auto h-6 w-6 text-muted-foreground/60" />
      <p className="mt-2 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2 ${done ? "bg-emerald-50/50" : "bg-background"}`}>
      <CheckCircle2 className={`h-4 w-4 ${done ? "text-emerald-600" : "text-muted-foreground/40"}`} />
      <span className={done ? "text-foreground line-through decoration-muted-foreground/40" : "text-foreground"}>
        {label}
      </span>
    </li>
  );
}
