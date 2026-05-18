import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Search, Loader2, Lock, Unlock, Video, Mic, ExternalLink, Sparkles } from "lucide-react";
import { listarCandidatosBusca, revelarContato } from "@/lib/empresa.functions";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type Candidato = Awaited<ReturnType<typeof listarCandidatosBusca>>[number];

export function CandidatosList() {
  const { user, loading: authLoading } = useAuth();
  const buscar = useServerFn(listarCandidatosBusca);
  const revelar = useServerFn(revelarContato);

  const [busca, setBusca] = useState("");
  const [profissao, setProfissao] = useState("");
  const [cidade, setCidade] = useState("");
  const [items, setItems] = useState<Candidato[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [contatos, setContatos] = useState<Record<string, { nome: string; whatsapp: string | null; email: string | null }>>({});
  const [revelandoId, setRevelandoId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    const t = setTimeout(() => {
      setCarregando(true);
      buscar({ data: { busca: busca || null, profissao: profissao || null, cidade: cidade || null, limite: 40 } })
        .then((r) => setItems(r))
        .catch((e) => toast.error(e instanceof Error ? e.message : "Erro ao buscar"))
        .finally(() => setCarregando(false));
    }, 300);
    return () => clearTimeout(t);
  }, [user, authLoading, buscar, busca, profissao, cidade]);

  const handleRevelar = async (c: Candidato) => {
    setRevelandoId(c.id);
    try {
      const r = await revelar({ data: { curriculo_id: c.id } });
      setContatos((m) => ({ ...m, [c.id]: r }));
      setItems((arr) => arr?.map((x) => (x.id === c.id ? { ...x, ja_revelado: true } : x)) ?? null);
      toast.success("Contato revelado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao revelar");
    } finally {
      setRevelandoId(null);
    }
  };

  const total = items?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Candidatos disponíveis</h1>
          <p className="text-sm text-muted-foreground">
            {carregando ? "Buscando…" : `${total} perfis encontrados`}
          </p>
        </div>
        <Link to="/empresa/nova-vaga"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">
          <Sparkles className="h-4 w-4" /> Publicar vaga
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, profissão ou experiência…"
            className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <input value={profissao} onChange={(e) => setProfissao(e.target.value)} placeholder="Profissão"
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
        <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade"
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
      </div>

      {items === null ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
          <p className="font-bold">Nenhum candidato encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajuste os filtros ou aguarde — novos currículos chegam todos os dias.
          </p>
          <Link to="/empresa/pagina" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            Criar página de captação
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {items.map((c) => {
            const contato = contatos[c.id];
            const habilidades = Array.isArray(c.habilidades) ? (c.habilidades as string[]) : [];
            return (
              <article key={c.id} className="relative rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {c.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold leading-tight">{c.nome}</h3>
                    <p className="text-xs text-muted-foreground">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      {[c.bairro, c.cidade].filter(Boolean).join(", ") || "Localização não informada"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{c.profissao}</span>
                      {c.tem_video && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                          <Video className="h-3 w-3" /> Vídeo
                        </span>
                      )}
                      {c.tem_audio && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning">
                          <Mic className="h-3 w-3" /> Áudio
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {c.resumo && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{c.resumo}</p>}

                {habilidades.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {habilidades.slice(0, 6).map((h) => (
                      <span key={h} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">{h}</span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <Link to="/cv/$slug" params={{ slug: c.slug }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                    Ver currículo completo <ExternalLink className="h-3 w-3" />
                  </Link>

                  {contato ? (
                    <div className="flex flex-wrap gap-1.5">
                      {contato.whatsapp && (
                        <a href={`https://wa.me/55${contato.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-foreground">
                          <Phone className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      )}
                      {contato.email && (
                        <a href={`mailto:${contato.email}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold">
                          E-mail
                        </a>
                      )}
                    </div>
                  ) : c.ja_revelado ? (
                    <button onClick={() => handleRevelar(c)} disabled={revelandoId === c.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60">
                      {revelandoId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
                      Ver contato
                    </button>
                  ) : (
                    <button onClick={() => handleRevelar(c)} disabled={revelandoId === c.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60">
                      {revelandoId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                      Revelar contato
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
