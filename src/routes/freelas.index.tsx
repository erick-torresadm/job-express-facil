import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Zap,
  Palette,
  Code2,
  Smartphone,
  Megaphone,
  PenTool,
  Camera,
  Video,
  Mic,
  Languages,
  Briefcase,
  Home,
  Brush,
  MoreHorizontal,
  Star,
  Clock,
  ShieldCheck,
  Flame,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { CATEGORIAS_FREELA, listFreelancers } from "@/lib/freelas.functions";

export const Route = createFileRoute("/freelas/")({
  head: () => ({
    meta: [
      { title: "Freelas — encontre profissionais e serviços rápidos | VagasAgora" },
      {
        name: "description",
        content:
          "Encontre freelancers e serviços para casa em minutos. Designers, devs, encanadores, eletricistas, fotógrafos. Contato direto por WhatsApp, sem comissão.",
      },
      { property: "og:title", content: "Freelas & Serviços — VagasAgora" },
      {
        property: "og:description",
        content: "Freelancers e serviços rápidos. Sem intermediário, sem comissão.",
      },
    ],
  }),
  errorComponent: () => <div className="p-8 text-center">Erro ao carregar freelas.</div>,
  notFoundComponent: () => <div className="p-8 text-center">Página não encontrada.</div>,
  component: FreelasHome,
});

const CATEGORY_ICONS: Record<string, { icon: typeof Palette; hue: string }> = {
  "design-grafico": { icon: Palette, hue: "from-fuchsia-500/20 to-pink-500/10 text-fuchsia-600" },
  "design-ui-ux": { icon: Brush, hue: "from-violet-500/20 to-indigo-500/10 text-violet-600" },
  "desenvolvimento-web": { icon: Code2, hue: "from-sky-500/20 to-cyan-500/10 text-sky-600" },
  "desenvolvimento-mobile": { icon: Smartphone, hue: "from-emerald-500/20 to-teal-500/10 text-emerald-600" },
  "social-media": { icon: Megaphone, hue: "from-rose-500/20 to-orange-500/10 text-rose-600" },
  "marketing-digital": { icon: Sparkles, hue: "from-amber-500/20 to-yellow-500/10 text-amber-600" },
  "redacao-copywriting": { icon: PenTool, hue: "from-blue-500/20 to-indigo-500/10 text-blue-600" },
  fotografia: { icon: Camera, hue: "from-slate-500/20 to-zinc-500/10 text-slate-700" },
  "video-edicao": { icon: Video, hue: "from-red-500/20 to-rose-500/10 text-red-600" },
  "audio-locucao": { icon: Mic, hue: "from-purple-500/20 to-fuchsia-500/10 text-purple-600" },
  traducao: { icon: Languages, hue: "from-teal-500/20 to-cyan-500/10 text-teal-600" },
  consultoria: { icon: Briefcase, hue: "from-indigo-500/20 to-blue-500/10 text-indigo-600" },
  "arquitetura-interiores": { icon: Home, hue: "from-stone-500/20 to-amber-500/10 text-stone-700" },
  ilustracao: { icon: Brush, hue: "from-pink-500/20 to-rose-500/10 text-pink-600" },
  outros: { icon: MoreHorizontal, hue: "from-gray-500/20 to-slate-500/10 text-gray-600" },
};

const QUICK_TAGS = [
  { label: "Preciso hoje", icon: Zap, q: "urgente" },
  { label: "Logo & identidade", icon: Palette, cat: "design-grafico" },
  { label: "Landing page", icon: Code2, cat: "desenvolvimento-web" },
  { label: "Edição de vídeo", icon: Video, cat: "video-edicao" },
  { label: "Social media", icon: Megaphone, cat: "social-media" },
  { label: "Fotógrafo", icon: Camera, cat: "fotografia" },
];

function FreelasHome() {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<string>("");
  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState("");

  const { data: freelas, isLoading } = useQuery({
    queryKey: ["freelas", categoria, cidade, q],
    queryFn: () =>
      listFreelancers({
        data: {
          categoria: categoria || undefined,
          cidade: cidade || undefined,
          q: q || undefined,
          limit: 24,
          offset: 0,
        },
      }),
  });

  const destaques = useMemo(() => (freelas ?? []).filter((f: any) => f.destaque).slice(0, 6), [freelas]);
  const restantes = useMemo(
    () => (freelas ?? []).filter((f: any) => !destaques.find((d: any) => d.id === f.id)),
    [freelas, destaques],
  );

  return (
    <div className="pb-24">
      {/* HERO — dark spotlight */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.3_0.15_260)_0%,transparent_50%),radial-gradient(circle_at_80%_60%,oklch(0.35_0.18_245)_0%,transparent_45%),linear-gradient(180deg,oklch(0.18_0.08_260)_0%,oklch(0.22_0.1_260)_100%)]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(oklch(1_0_0_/_0.4)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl animate-pulse" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="flex flex-col items-start gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              <Flame className="h-3.5 w-3.5 text-amber-300" /> Novo no VagasAgora
            </span>
            <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
              Achou.<span className="text-accent"> Falou.</span>
              <br />
              <span className="bg-gradient-to-r from-white via-white to-accent/90 bg-clip-text text-transparent">
                Resolveu.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/80 md:text-lg">
              Freelancers criativos e profissionais para casa. Fale direto no WhatsApp em minutos,
              sem cadastro, sem leilão, sem comissão.
            </p>
          </div>

          {/* Big search */}
          <div className="mt-8 rounded-3xl border border-white/15 bg-white/95 p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-md md:p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="grid gap-2 md:grid-cols-[1.5fr_1fr_auto] md:gap-2"
            >
              <label className="group relative flex items-center gap-2 rounded-2xl bg-secondary/60 px-4 focus-within:bg-secondary">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="O que você precisa? Ex: logo, pintor, editor…"
                  className="w-full bg-transparent py-3.5 text-sm font-medium outline-none placeholder:text-muted-foreground"
                />
              </label>
              <label className="group relative flex items-center gap-2 rounded-2xl bg-secondary/60 px-4 focus-within:bg-secondary">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade ou remoto"
                  className="w-full bg-transparent py-3.5 text-sm font-medium outline-none placeholder:text-muted-foreground"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
              >
                <Search className="h-4 w-4" /> Buscar
              </button>
            </form>

            {/* Quick tags */}
            <div className="mt-2 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1 pt-2 [scrollbar-width:none] md:flex-wrap md:overflow-visible">
              {QUICK_TAGS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => {
                    if (t.cat) setCategoria(t.cat);
                    if (t.q) setQ(t.q);
                    document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80 transition hover:border-accent hover:text-accent"
                >
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-medium text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-300" /> Sem comissão
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-300" /> Contato direto
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-sky-300" /> Perfis verificados
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 text-yellow-300" /> Avaliações reais
            </span>
          </div>
        </div>
      </section>

      {/* CATEGORIAS — bento */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Navegue por área</p>
            <h2 className="mt-1 font-display text-2xl font-black md:text-3xl">Categorias</h2>
          </div>
          <button
            onClick={() => setCategoria("")}
            className="hidden text-xs font-semibold text-muted-foreground hover:text-foreground md:inline-flex"
          >
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {CATEGORIAS_FREELA.map((c) => {
            const meta = CATEGORY_ICONS[c.slug] ?? CATEGORY_ICONS.outros;
            const Icon = meta.icon;
            const active = categoria === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => {
                  setCategoria(active ? "" : c.slug);
                  document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-pop"
                    : "border-border bg-card hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-soft"
                }`}
              >
                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${
                    active ? "from-white/25 to-white/10 text-white" : meta.hue
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold leading-tight">{c.label}</span>
                <ChevronRight
                  className={`absolute right-3 top-3 h-4 w-4 transition ${
                    active ? "text-white/80" : "text-muted-foreground/40 group-hover:text-accent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* DESTAQUES horizontal scroll */}
      {destaques.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
                <Flame className="h-3.5 w-3.5" /> Em alta esta semana
              </p>
              <h2 className="mt-1 font-display text-2xl font-black md:text-3xl">Destaques</h2>
            </div>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {destaques.map((f: any) => (
              <FreelaCard key={f.id} f={f} className="w-[280px] shrink-0 snap-start md:w-[320px]" featured />
            ))}
          </div>
        </section>
      )}

      {/* RESULTADOS */}
      <section id="resultados" className="mx-auto max-w-6xl px-4 pt-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent">
              {categoria ? CATEGORIAS_FREELA.find((c) => c.slug === categoria)?.label : "Todos"}
            </p>
            <h2 className="mt-1 font-display text-2xl font-black md:text-3xl">
              {isLoading ? "Buscando…" : `${freelas?.length ?? 0} profissionais`}
            </h2>
          </div>
          {(categoria || q || cidade) && (
            <button
              onClick={() => {
                setCategoria("");
                setQ("");
                setCidade("");
              }}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-accent"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-secondary/60" />
            ))}
          </div>
        )}

        {!isLoading && (freelas?.length ?? 0) === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold">Nenhum profissional agora</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Tente outra palavra-chave ou remova a cidade. Ou crie sua vitrine e seja o primeiro
              desta categoria.
            </p>
            <Link
              to="/freelancer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Criar vitrine grátis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!isLoading && restantes.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restantes.map((f: any) => (
              <FreelaCard key={f.id} f={f} />
            ))}
          </div>
        )}
      </section>

      {/* CTA para virar freela */}
      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary via-primary to-accent p-8 text-primary-foreground shadow-pop md:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Wrench className="h-3.5 w-3.5" /> Para profissionais
              </span>
              <h2 className="mt-3 font-display text-2xl font-black md:text-4xl">
                É freela ou presta serviço?
              </h2>
              <p className="mt-2 max-w-lg text-primary-foreground/85">
                Monte sua vitrine em 3 minutos. Portfólio, contatos e avaliações.{" "}
                <strong className="text-white">Grátis por 2 anos</strong> durante a promoção.
              </p>
            </div>
            <Link
              to="/freelancer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-black text-primary shadow-soft transition hover:scale-[1.03]"
            >
              Criar vitrine grátis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FreelaCard({
  f,
  className = "",
  featured = false,
}: {
  f: any;
  className?: string;
  featured?: boolean;
}) {
  const catMeta = CATEGORY_ICONS[f.categoria_principal as string] ?? CATEGORY_ICONS.outros;
  const CatIcon = catMeta.icon;

  return (
    <Link
      to="/freelas/p/$handle"
      params={{ handle: f.handle }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-pop ${className}`}
    >
      {/* Cover */}
      <div className="relative h-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/25 to-fuchsia-500/20"
          style={
            f.cover_url
              ? { backgroundImage: `url(${f.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        {featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2 py-0.5 text-[10px] font-black uppercase text-amber-950 shadow">
            <Flame className="h-3 w-3" /> Destaque
          </span>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-foreground shadow backdrop-blur">
          <CatIcon className="h-3 w-3" />
          {CATEGORIAS_FREELA.find((c) => c.slug === f.categoria_principal)?.label ?? "Freela"}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="-mt-10 flex items-end gap-3">
          <div className="relative">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-card bg-secondary text-xl font-black text-primary shadow-soft">
              {f.avatar_url ? (
                <img src={f.avatar_url} alt={f.nome} className="h-full w-full object-cover" />
              ) : (
                f.nome.slice(0, 1).toUpperCase()
              )}
            </div>
            {f.verificado && (
              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-card bg-sky-500 text-white">
                <CheckCircle2 className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 min-w-0">
          <h3 className="line-clamp-1 font-display text-base font-black group-hover:text-accent">
            {f.nome}
          </h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">{f.headline || "Freelancer"}</p>
        </div>

        {(f.skills ?? []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {(f.skills ?? []).slice(0, 3).map((s: string) => (
              <span
                key={s}
                className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-foreground/70"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 text-xs">
          <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {f.cidade ?? "Remoto"}
            {f.atende_remoto && f.cidade ? " · Remoto" : ""}
          </span>
          {f.valor_hora_min != null ? (
            <span className="rounded-full bg-primary/10 px-2 py-1 font-black text-primary">
              R$ {f.valor_hora_min}
              <span className="text-[10px] font-medium text-primary/70">/h</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <Clock className="h-3 w-3" /> Sob consulta
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
