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

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16">
      {/* Capa */}
      <div
        className="h-40 w-full rounded-b-3xl bg-gradient-to-br from-primary via-primary to-accent md:h-56"
        style={freela.cover_url ? { backgroundImage: `url(${freela.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      />

      {/* Header */}
      <div className="-mt-14 flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-end md:p-6">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-card bg-secondary text-3xl font-bold text-primary shadow-pop md:h-28 md:w-28">
          {freela.avatar_url ? (
            <img src={freela.avatar_url} alt={freela.nome} className="h-full w-full object-cover" />
          ) : (
            freela.nome.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-black md:text-3xl">{freela.nome}</h1>
            {freela.verificado && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verificado
              </span>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">{freela.headline}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {freela.cidade && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {freela.cidade}
                {freela.estado ? `, ${freela.estado}` : ""}
              </span>
            )}
            {freela.atende_remoto && <span>· Atende remoto</span>}
            {notaMedia != null && (
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {notaMedia.toFixed(1)} ({avaliacoes.length})
              </span>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
            </a>
          )}
          <button
            onClick={() => setOrcamentoOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-primary/5 px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/10"
          >
            <Send className="h-4 w-4" /> Solicitar orçamento
          </button>
        </div>
      </div>

      {/* Skills + Bio + Contatos */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {freela.bio && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Sobre</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">{freela.bio}</p>
            </section>
          )}

          {freela.skills && freela.skills.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Habilidades</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {freela.skills.map((s: string) => (
                  <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Portfólio */}
          <section>
            <h2 className="mb-4 font-display text-xl font-bold">Portfólio</h2>
            {projetos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                Ainda sem projetos publicados.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {projetos.map((p: any) => (
                  <article key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    {(p.capa_url || p.imagens?.[0]) && (
                      <img
                        src={p.capa_url || p.imagens[0]}
                        alt={p.titulo}
                        className="h-40 w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold">{p.titulo}</h3>
                      {p.cliente_nome && (
                        <p className="text-xs text-muted-foreground">Cliente: {p.cliente_nome}{p.ano ? ` · ${p.ano}` : ""}</p>
                      )}
                      {p.descricao && (
                        <p className="mt-2 line-clamp-3 text-sm text-foreground/80">{p.descricao}</p>
                      )}
                      {p.link_externo && (
                        <a href={p.link_externo} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-accent underline">
                          Ver projeto →
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">
                Avaliações {avaliacoes.length > 0 && `(${avaliacoes.length})`}
              </h2>
              <button
                onClick={() => setAvaliarOpen(true)}
                className="text-xs font-semibold text-accent underline"
              >
                Deixar avaliação
              </button>
            </div>
            {avaliacoes.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Sem avaliações ainda — seja o primeiro.
              </p>
            ) : (
              <ul className="space-y-3">
                {avaliacoes.map((a: any) => (
                  <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < a.nota ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`}
                        />
                      ))}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{a.comentario}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      — {a.autor_nome}
                      {a.autor_empresa ? `, ${a.autor_empresa}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar contatos */}
        <aside className="space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-xs font-bold uppercase text-muted-foreground">Contato & links</h3>
            <div className="mt-3 space-y-2 text-sm">
              {freela.instagram && (
                <a href={`https://instagram.com/${freela.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent">
                  <Instagram className="h-4 w-4" /> @{freela.instagram.replace(/^@/, "")}
                </a>
              )}
              {freela.linkedin && (
                <a href={freela.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              )}
              {freela.behance && (
                <a href={freela.behance} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent">
                  <Globe className="h-4 w-4" /> Behance
                </a>
              )}
              {freela.site && (
                <a href={freela.site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent">
                  <Globe className="h-4 w-4" /> Site
                </a>
              )}
            </div>
          </div>

          {freela.valor_hora_min != null && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-xs font-bold uppercase text-muted-foreground">Valor a partir de</h3>
              <p className="mt-1 font-display text-2xl font-black">
                R$ {freela.valor_hora_min}
                <span className="text-sm font-normal text-muted-foreground">/hora</span>
              </p>
            </div>
          )}
        </aside>
      </div>

      {orcamentoOpen && <OrcamentoModal freelaId={freela.id} onClose={() => setOrcamentoOpen(false)} />}
      {avaliarOpen && <AvaliarModal freelaId={freela.id} onClose={() => setAvaliarOpen(false)} />}
    </div>
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
        className="w-full max-w-md space-y-3 rounded-3xl bg-background p-6 shadow-pop"
      >
        <h2 className="font-display text-xl font-bold">Solicitar orçamento</h2>
        <input required minLength={2} placeholder="Seu nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <input required placeholder="WhatsApp (com DDD)" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <input type="email" placeholder="E-mail (opcional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <textarea required minLength={10} rows={4} placeholder="Descreva o que você precisa…" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border py-2 text-sm font-semibold">Cancelar</button>
          <button type="submit" disabled={m.isPending} className="flex-1 rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
        className="w-full max-w-md space-y-3 rounded-3xl bg-background p-6 shadow-pop"
      >
        <h2 className="font-display text-xl font-bold">Deixar avaliação</h2>
        <input required minLength={2} placeholder="Seu nome" value={form.autor_nome} onChange={(e) => setForm({ ...form, autor_nome: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <input placeholder="Empresa (opcional)" value={form.autor_empresa} onChange={(e) => setForm({ ...form, autor_empresa: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <div className="flex items-center gap-2">
          <span className="text-sm">Nota:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setForm({ ...form, nota: n })}>
              <Star className={`h-6 w-6 ${n <= form.nota ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
            </button>
          ))}
        </div>
        <textarea required minLength={10} rows={4} placeholder="Como foi trabalhar com esse freela?" value={form.comentario} onChange={(e) => setForm({ ...form, comentario: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border py-2 text-sm font-semibold">Cancelar</button>
          <button type="submit" disabled={m.isPending} className="flex-1 rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {m.isPending ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}
