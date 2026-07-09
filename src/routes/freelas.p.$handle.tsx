import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  Star,
  MapPin,
  MessageCircle,
  Instagram,
  Linkedin,
  Globe,
  Send,
  ArrowLeft,
  Sparkles,
  Award,
  Layers,
  Zap,
  Share2,
} from "lucide-react";
import { getFreelancerPublico, enviarOrcamento, enviarAvaliacao } from "@/lib/freelas.functions";

export const Route = createFileRoute("/freelas/p/$handle")({
  loader: async ({ params }) => {
    const data = await getFreelancerPublico({ data: { handle: params.handle } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Freelancer não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const { freela } = loaderData;
    const title = `${freela.nome} — ${freela.headline || "Freelancer"} | VagasAgora`;
    const desc = (freela.bio || freela.headline || `${freela.nome} no VagasAgora`).slice(0, 155);
    const img = freela.cover_url || freela.avatar_url;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(img ? [{ property: "og:image", content: img }] : []),
        { property: "og:type", content: "profile" },
      ],
    };
  },
  errorComponent: () => <div className="p-8 text-center">Erro ao carregar perfil.</div>,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md p-10 text-center">
      <h1 className="font-display text-2xl font-bold">Freelancer não encontrado</h1>
      <Link to="/freelas" className="mt-4 inline-block text-accent underline">
        Ver todos os freelas
      </Link>
    </div>
  ),
  component: FreelaPerfil,
});

function FreelaPerfil() {
  const { freela, projetos, avaliacoes, notaMedia } = Route.useLoaderData();
  const [orcamentoOpen, setOrcamentoOpen] = useState(false);
  const [avaliarOpen, setAvaliarOpen] = useState(false);

  const waLink = freela.whatsapp
    ? `https://wa.me/55${freela.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Olá ${freela.nome}, vi seu perfil no VagasAgora e quero conversar sobre um projeto.`,
      )}`
    : null;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: freela.nome, text: freela.headline ?? "", url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  return (
    <div className="pb-32">
      {/* Voltar */}
      <div className="mx-auto max-w-5xl px-4 pt-2">
        <Link
          to="/freelas"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Todos os freelas
        </Link>
      </div>

      {/* HERO */}
      <section className="relative mt-3">
        <div
          className="relative h-40 w-full overflow-hidden md:h-56"
          style={
            freela.cover_url
              ? { backgroundImage: `url(${freela.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!freela.cover_url && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,oklch(0.35_0.18_260)_0%,transparent_45%),radial-gradient(circle_at_80%_70%,oklch(0.4_0.2_320)_0%,transparent_45%),linear-gradient(135deg,oklch(0.22_0.1_260),oklch(0.3_0.15_260))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-background" />
        </div>

        {/* Header card */}
        <div className="mx-auto -mt-10 max-w-5xl px-4 md:-mt-14">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-pop md:p-7">
            {/* Avatar acima (sobrepondo capa) */}
            <div className="-mt-16 mb-4 flex items-end gap-4 md:-mt-24">
              <div className="relative">
                <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-card bg-secondary text-3xl font-black text-primary shadow-pop md:h-32 md:w-32 md:text-4xl">
                  {freela.avatar_url ? (
                    <img src={freela.avatar_url} alt={freela.nome} className="h-full w-full object-cover" />
                  ) : (
                    freela.nome.slice(0, 1).toUpperCase()
                  )}
                </div>
                {freela.verificado && (
                  <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-4 border-card bg-sky-500 text-white shadow">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                )}
              </div>
            </div>

            {/* Nome + headline + meta (linha própria, largura total) */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-black leading-tight break-words sm:text-3xl md:text-4xl">
                  {freela.nome}
                </h1>
                {freela.destaque && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800">
                    <Sparkles className="h-3 w-3" /> Pro
                  </span>
                )}
              </div>
              {freela.headline && (
                <p className="mt-1 text-base text-muted-foreground md:text-lg">
                  {freela.headline}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                {freela.cidade && (
                  <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {freela.cidade}
                    {freela.estado ? `, ${freela.estado}` : ""}
                  </span>
                )}
                {freela.atende_remoto && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                    <Zap className="h-3 w-3" /> Atende remoto
                  </span>
                )}
                {notaMedia != null && (
                  <span className="inline-flex items-center gap-1 font-bold text-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {notaMedia.toFixed(1)}
                    <span className="font-medium text-muted-foreground">
                      ({avaliacoes.length})
                    </span>
                  </span>
                )}
              </div>
            </div>


            {/* Ações */}
            <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              {waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-emerald-600 active:scale-[0.98]"
                >
                  <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
                </a>
              ) : (
                <div className="hidden sm:block" />
              )}
              <button
                onClick={() => setOrcamentoOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
              >
                <Send className="h-4 w-4" /> Orçamento
              </button>
              <button
                onClick={share}
                aria-label="Compartilhar"
                className="grid h-12 w-full place-items-center rounded-2xl border border-border hover:border-accent sm:w-12"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Stats strip */}
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-secondary/50 p-2">
              <Stat icon={Layers} label="Projetos" value={projetos.length} />
              <Stat icon={Star} label="Avaliações" value={avaliacoes.length} />
              <Stat
                icon={Award}
                label="Nível"
                value={freela.nivel ? String(freela.nivel).charAt(0).toUpperCase() + String(freela.nivel).slice(1) : "—"}
              />
            </div>
          </div>
        </div>
      </section>


      {/* Corpo */}
      <div className="mx-auto mt-8 grid max-w-5xl gap-6 px-4 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-6">
          {freela.bio && (
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-black">Sobre</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {freela.bio}
              </p>
            </section>
          )}

          {freela.skills && freela.skills.length > 0 && (
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-black">Habilidades</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {freela.skills.map((s: string) => (
                  <span
                    key={s}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Portfólio */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-accent">Trabalhos</p>
                <h2 className="font-display text-xl font-black">Portfólio</h2>
              </div>
              <span className="text-xs text-muted-foreground">{projetos.length} projeto(s)</span>
            </div>
            {projetos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                Ainda sem projetos publicados.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {projetos.map((p: any) => (
                  <article
                    key={p.id}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-pop"
                  >
                    {(p.capa_url || p.imagens?.[0]) && (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={p.capa_url || p.imagens[0]}
                          alt={p.titulo}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-display font-bold group-hover:text-accent">{p.titulo}</h3>
                      {p.cliente_nome && (
                        <p className="text-xs text-muted-foreground">
                          {p.cliente_nome}
                          {p.ano ? ` · ${p.ano}` : ""}
                        </p>
                      )}
                      {p.descricao && (
                        <p className="mt-2 line-clamp-3 text-sm text-foreground/80">{p.descricao}</p>
                      )}
                      {p.link_externo && (
                        <a
                          href={p.link_externo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                        >
                          Ver projeto <Globe className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Avaliações */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-accent">Reputação</p>
                <h2 className="font-display text-xl font-black">
                  Avaliações {avaliacoes.length > 0 && `(${avaliacoes.length})`}
                </h2>
              </div>
              <button
                onClick={() => setAvaliarOpen(true)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold hover:border-accent"
              >
                Deixar avaliação
              </button>
            </div>
            {avaliacoes.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Sem avaliações ainda — seja o primeiro.
              </p>
            ) : (
              <ul className="space-y-3">
                {avaliacoes.map((a: any) => (
                  <li key={a.id} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < a.nota ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{a.comentario}</p>
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                      — {a.autor_nome}
                      {a.autor_empresa ? `, ${a.autor_empresa}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar sticky */}
        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          {freela.valor_hora_min != null && (
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                A partir de
              </p>
              <p className="mt-1 font-display text-3xl font-black text-primary">
                R$ {freela.valor_hora_min}
                <span className="text-sm font-medium text-muted-foreground">/hora</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Valor final combinado direto.</p>
            </div>
          )}

          <div className="rounded-3xl border border-border bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Links & contato
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              {freela.instagram && (
                <ContactLink
                  href={`https://instagram.com/${freela.instagram.replace(/^@/, "")}`}
                  icon={Instagram}
                  label={`@${freela.instagram.replace(/^@/, "")}`}
                />
              )}
              {freela.linkedin && (
                <ContactLink href={freela.linkedin} icon={Linkedin} label="LinkedIn" />
              )}
              {freela.behance && (
                <ContactLink href={freela.behance} icon={Globe} label="Behance" />
              )}
              {freela.site && <ContactLink href={freela.site} icon={Globe} label="Site pessoal" />}
              {!freela.instagram && !freela.linkedin && !freela.behance && !freela.site && (
                <p className="text-xs text-muted-foreground">Sem links públicos.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Floating CTA mobile */}
      {waLink && (
        <div className="fixed inset-x-0 bottom-20 z-40 mx-auto flex max-w-md justify-center px-4 lg:hidden">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-black text-white shadow-pop"
          >
            <MessageCircle className="h-4 w-4" /> Chamar {freela.nome.split(" ")[0]} no WhatsApp
          </a>
        </div>
      )}

      {orcamentoOpen && <OrcamentoModal freelaId={freela.id} onClose={() => setOrcamentoOpen(false)} />}
      {avaliarOpen && <AvaliarModal freelaId={freela.id} onClose={() => setAvaliarOpen(false)} />}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-card px-3 py-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-display text-base font-black">{value}</p>
      </div>
    </div>
  );
}

function ContactLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Globe;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium hover:bg-secondary hover:text-accent"
    >
      <Icon className="h-4 w-4" /> {label}
    </a>
  );
}

function OrcamentoModal({ freelaId, onClose }: { freelaId: string; onClose: () => void }) {
  const [form, setForm] = useState({ nome: "", whatsapp: "", email: "", descricao: "" });
  const m = useMutation({
    mutationFn: () =>
      enviarOrcamento({
        data: {
          freelancer_id: freelaId,
          nome: form.nome,
          whatsapp: form.whatsapp,
          email: form.email || undefined,
          descricao: form.descricao,
        },
      }),
    onSuccess: () => {
      toast.success("Orçamento enviado! O freela receberá seu contato.");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
        className="w-full max-w-md space-y-3 rounded-3xl border border-border bg-background p-6 shadow-pop animate-scale-in"
      >
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Send className="h-4 w-4" />
          </div>
          <h2 className="font-display text-xl font-black">Solicitar orçamento</h2>
        </div>
        <input required minLength={2} placeholder="Seu nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <input required placeholder="WhatsApp (com DDD)" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <input type="email" placeholder="E-mail (opcional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <textarea required minLength={10} rows={4} placeholder="Descreva o que você precisa…" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold">Cancelar</button>
          <button type="submit" disabled={m.isPending} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
            {m.isPending ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AvaliarModal({ freelaId, onClose }: { freelaId: string; onClose: () => void }) {
  const [form, setForm] = useState({ autor_nome: "", autor_empresa: "", nota: 5, comentario: "" });
  const m = useMutation({
    mutationFn: () =>
      enviarAvaliacao({
        data: {
          freelancer_id: freelaId,
          autor_nome: form.autor_nome,
          autor_empresa: form.autor_empresa || undefined,
          nota: form.nota,
          comentario: form.comentario,
        },
      }),
    onSuccess: () => {
      toast.success("Avaliação enviada. Ela aparece após aprovação do freela.");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
        className="w-full max-w-md space-y-3 rounded-3xl border border-border bg-background p-6 shadow-pop animate-scale-in"
      >
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Star className="h-4 w-4 fill-current" />
          </div>
          <h2 className="font-display text-xl font-black">Deixar avaliação</h2>
        </div>
        <input required minLength={2} placeholder="Seu nome" value={form.autor_nome} onChange={(e) => setForm({ ...form, autor_nome: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <input placeholder="Empresa (opcional)" value={form.autor_empresa} onChange={(e) => setForm({ ...form, autor_empresa: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <div className="flex items-center gap-2 rounded-xl bg-secondary/50 p-3">
          <span className="text-sm font-semibold">Nota:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setForm({ ...form, nota: n })} className="transition hover:scale-110">
              <Star className={`h-7 w-7 ${n <= form.nota ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
            </button>
          ))}
        </div>
        <textarea required minLength={10} rows={4} placeholder="Como foi trabalhar com esse freela?" value={form.comentario} onChange={(e) => setForm({ ...form, comentario: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold">Cancelar</button>
          <button type="submit" disabled={m.isPending} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
            {m.isPending ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}
