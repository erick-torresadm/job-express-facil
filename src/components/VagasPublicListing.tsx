import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Search, MapPin, Briefcase, Zap, ArrowRight, X, Navigation, Loader2,
  Wallet, Clock3, SlidersHorizontal, ShieldCheck, Building2, ListChecks,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listarVagasPublicas, type VagaPublica } from "@/lib/vagas.functions";
import { VagaActions } from "@/components/VagaActions";

type Regime = "clt" | "pj" | "estagio" | "outros";

export type { VagaPublica };

function isNova(iso: string) {
  return Date.now() - new Date(iso).getTime() < 48 * 3600_000;
}

const TABS: Array<{ to: "/vagas" | "/vagas/clt" | "/vagas/pj" | "/vagas/estagio"; label: string; regime: Regime | "todos"; desc: string }> = [
  { to: "/vagas", label: "Todas", regime: "todos", desc: "Todas as oportunidades" },
  { to: "/vagas/clt", label: "CLT", regime: "clt", desc: "Carteira assinada" },
  { to: "/vagas/pj", label: "PJ", regime: "pj", desc: "Autônomo, MEI e microempresa" },
  { to: "/vagas/estagio", label: "Estágio", regime: "estagio", desc: "Universitários e trainees" },
];

const REGIME_LABEL: Record<Regime, string> = {
  clt: "CLT", pj: "PJ", estagio: "Estágio", outros: "Outros",
};

function slugCidade(cidade: string) {
  return cidade.toLowerCase().replace(/\s+/g, "-");
}

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "há poucos minutos";
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d} dias`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface Props {
  regime: Regime | "todos";
  titulo: string;
  subtitulo: string;
}

export function VagasPublicListing({ regime, titulo, subtitulo }: Props) {
  const [vagas, setVagas] = useState<VagaPublica[] | null>(null);
  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState("");
  const [urgente, setUrgente] = useState(false);
  const [totalPorRegime, setTotalPorRegime] = useState<Record<Regime | "todos", number>>({
    todos: 0, clt: 0, pj: 0, estagio: 0, outros: 0,
  });

  const [pertoDeMim, setPertoDeMim] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const listar = useServerFn(listarVagasPublicas);

  async function ativarPertoDeMim() {
    setErroLocal(null);
    setBuscandoLocal(true);
    try {
      const gps = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("sem suporte"));
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => reject(new Error("negado")),
          { timeout: 8000 },
        );
      }).catch(async () => {
        // fallback: localização salva no perfil do candidato logado
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return null;
        const { data: perfil } = await supabase
          .from("profiles")
          .select("latitude, longitude")
          .eq("id", auth.user.id)
          .maybeSingle();
        if (perfil?.latitude != null && perfil?.longitude != null) {
          return { lat: perfil.latitude, lng: perfil.longitude };
        }
        return null;
      });

      if (!gps) {
        setErroLocal("Não conseguimos sua localização. Ative o GPS ou preencha seu endereço no perfil.");
        return;
      }
      setCoords(gps);
      setPertoDeMim(true);
    } finally {
      setBuscandoLocal(false);
    }
  }

  function desativarPertoDeMim() {
    setPertoDeMim(false);
    setCoords(null);
    setErroLocal(null);
  }

  const [selecionada, setSelecionada] = useState<VagaPublica | null>(null);

  useEffect(() => {
    (async () => {
      setVagas(null);
      const res = await listar({
        data: {
          regime: regime === "todos" ? undefined : regime,
          ...(pertoDeMim && coords ? { lat: coords.lat, lng: coords.lng } : {}),
          q: q.trim() || undefined,
          cidade: !pertoDeMim && cidade.trim() ? cidade.trim() : undefined,
          urgente: urgente || undefined,
          limit: pertoDeMim ? 60 : 80,
        },
      });
      setVagas(res.vagas as VagaPublica[]);
    })();
  }, [regime, q, cidade, urgente, pertoDeMim, coords]);

  // Painel de detalhe (desktop): mantém a vaga selecionada em sincronia com
  // a lista carregada — seleciona a primeira por padrão, estilo InfoJobs.
  useEffect(() => {
    if (!vagas || vagas.length === 0) { setSelecionada(null); return; }
    if (!selecionada || !vagas.some((v) => v.id === selecionada.id)) setSelecionada(vagas[0]);
  }, [vagas]);

  function abrirVaga(e: React.MouseEvent, v: VagaPublica) {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      e.preventDefault();
      setSelecionada(v);
    }
  }

  useEffect(() => {
    (async () => {
      const call = (r?: Regime) => {
        const qb = supabase.from("vagas")
          .select("id", { count: "exact", head: true })
          .eq("ativa", true).lt("risco_fraude", 70);
        return r ? qb.eq("regime", r) : qb;
      };
      const [{ count: t }, { count: c }, { count: p }, { count: e }, { count: o }] = await Promise.all([
        call(), call("clt"), call("pj"), call("estagio"), call("outros"),
      ]);
      setTotalPorRegime({
        todos: t ?? 0, clt: c ?? 0, pj: p ?? 0, estagio: e ?? 0, outros: o ?? 0,
      });
    })();
  }, []);

  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const activeFilters = [
    q && { k: "q", label: `"${q}"`, clear: () => setQ("") },
    cidade && { k: "c", label: cidade, clear: () => setCidade("") },
    urgente && { k: "u", label: "Urgente", clear: () => setUrgente(false) },
  ].filter(Boolean) as { k: string; label: string; clear: () => void }[];

  // Painel de filtros — mesmo bloco serve pra sidebar fixa (desktop) e pra
  // dentro do drawer mobile, evita duplicar o formulário duas vezes.
  const painelFiltros = (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Cargo, profissão ou empresa"
          className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
      </label>
      <label className="relative block">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={pertoDeMim}
          placeholder={pertoDeMim ? "Ignorado no modo perto de mim" : "Cidade"}
          className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary disabled:opacity-50" />
      </label>

      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Distância</p>
        <button
          onClick={() => (pertoDeMim ? desativarPertoDeMim() : ativarPertoDeMim())}
          disabled={buscandoLocal}
          className={`flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border text-sm font-bold transition disabled:opacity-60 ${
            pertoDeMim ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"
          }`}>
          {buscandoLocal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          {pertoDeMim ? "Perto de mim (ativo)" : "Buscar perto de mim"}
        </button>
        {erroLocal && <p className="mt-1.5 text-[11px] text-destructive">{erroLocal}</p>}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Urgência</p>
        <button onClick={() => setUrgente((u) => !u)}
          className={`flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border text-sm font-bold transition ${
            urgente ? "border-warning bg-warning text-warning-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"
          }`}>
          <Zap className="h-4 w-4" /> Só vagas urgentes
        </button>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Regime</p>
        <div className="space-y-1">
          {TABS.map((t) => {
            const active = t.regime === regime;
            const cnt = totalPorRegime[t.regime];
            return (
              <Link key={t.to} to={t.to}
                className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition ${
                  active ? "bg-primary text-primary-foreground font-bold" : "text-foreground hover:bg-secondary"
                }`}>
                <span>{t.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-primary-foreground/20" : "bg-secondary text-secondary-foreground"}`}>
                  {cnt}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          {activeFilters.map((f) => (
            <button key={f.k} onClick={f.clear}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
              {f.label} <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      {/* Header */}
      <header className="mb-5">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
          <Briefcase className="h-3 w-3" /> Vagas abertas
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{titulo}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitulo}</p>
      </header>

      {/* CTA persistente — cadastro rápido */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-accent/30 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 p-4">
        <div className="flex items-start gap-3">
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="text-sm font-bold">Quer receber as vagas certas no WhatsApp?</p>
            <p className="text-xs text-muted-foreground">Crie seu perfil em 60s (áudio ou vídeo), é 100% grátis.</p>
          </div>
        </div>
        <Link to="/cadastro" className="shrink-0 rounded-xl bg-accent px-4 py-2 text-xs font-extrabold text-accent-foreground shadow-pop transition hover:scale-[1.02]">
          Criar perfil grátis →
        </Link>
      </div>

      {/* Botão de filtros — só mobile/tablet, abre o mesmo painel da sidebar */}
      <button
        onClick={() => setFiltrosAbertos(true)}
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold lg:hidden"
      >
        <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filtros</span>
        {activeFilters.length > 0 && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{activeFilters.length}</span>
        )}
      </button>

      <div className="grid gap-6 lg:grid-cols-[220px_380px_1fr]">
        {/* Sidebar de filtros — fixa no desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 shadow-soft">
            {painelFiltros}
          </div>
        </aside>

        {/* Drawer de filtros — mobile/tablet */}
        {filtrosAbertos && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setFiltrosAbertos(false)} />
            <div className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto bg-background p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black">Filtros</h2>
                <button onClick={() => setFiltrosAbertos(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {painelFiltros}
              <button onClick={() => setFiltrosAbertos(false)}
                className="mt-6 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground">
                Ver {vagas?.length ?? ""} vaga{vagas?.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="min-w-0">
          {vagas === null ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
              ))}
            </div>
          ) : vagas.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
              <p className="text-base font-bold">Nenhuma vaga encontrada</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente remover filtros ou cadastre-se grátis pra ser avisado quando abrir vaga nova.
              </p>
              <Link to="/cadastro" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
                Cadastrar meu currículo grátis
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span><strong className="text-foreground">{vagas.length}</strong> vaga{vagas.length > 1 ? "s" : ""} encontrada{vagas.length > 1 ? "s" : ""}</span>
                <span>{pertoDeMim ? "Ordenado por mais perto" : "Ordenado por urgentes primeiro"}</span>
              </div>
              <ul className="space-y-3">
                {vagas.map((v) => (
                  <li key={v.id}>
                    <Link
                      to="/vagas/$slug"
                      params={{ slug: `${v.profissao_slug}-em-${slugCidade(v.cidade)}` }}
                      onClick={(e) => abrirVaga(e, v)}
                      className={`group block rounded-2xl border p-4 shadow-soft transition hover:border-primary/50 hover:shadow-pop sm:p-5 ${
                        selecionada?.id === v.id ? "border-primary bg-primary/5 lg:ring-1 lg:ring-primary/30" : "border-border bg-card"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isNova(v.created_at) && (
                          <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent">
                            Nova
                          </span>
                        )}
                        {v.urgente && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-warning/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-warning">
                            <Zap className="h-2.5 w-2.5" /> Urgente
                          </span>
                        )}
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                          {REGIME_LABEL[v.regime as Regime] ?? v.regime}
                        </span>
                        {v.distancia_km != null && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-secondary-foreground">
                            <Navigation className="h-2.5 w-2.5" /> {v.distancia_km} km
                          </span>
                        )}
                      </div>

                      <h2 className="mt-2 text-lg font-bold leading-tight tracking-tight group-hover:text-primary sm:text-xl">
                        {v.titulo}
                      </h2>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
                        {v.empresa_nome}
                        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/50" />
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" /> {v.bairro}, {v.cidade}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                          <Wallet className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> {v.salario}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5 shrink-0" /> {v.horario}
                        </span>
                      </div>

                      {v.descricao && (
                        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{v.descricao}</p>
                      )}

                      <footer className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px]">
                        <span className="text-muted-foreground">{tempoRelativo(v.created_at)}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-primary">
                          Ver vaga <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                        </span>
                      </footer>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Painel de detalhe — desktop only, mostra a vaga selecionada sem sair da página */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            {vagas === null ? (
              <div className="h-96 animate-pulse rounded-2xl bg-muted/50" />
            ) : selecionada ? (
              <VagaDetalhe vaga={selecionada} />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                Selecione uma vaga na lista pra ver os detalhes aqui.
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* CTA final */}
      <section className="mt-10 rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 text-center shadow-soft sm:p-8">
        <h3 className="text-xl font-black sm:text-2xl">Ainda não achou a sua?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre seu currículo grátis por áudio em 1 minuto e receba propostas de empresas verificadas no WhatsApp.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link to="/cadastro" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            Criar currículo grátis
          </Link>
          <Link to="/como-funciona" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold">
            Como funciona
          </Link>
        </div>
      </section>
    </div>
  );
}

function VagaDetalhe({ vaga }: { vaga: VagaPublica }) {
  return (
    <div className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-center gap-1.5">
        {isNova(vaga.created_at) && (
          <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent">Nova</span>
        )}
        {vaga.urgente && (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-warning/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-warning">
            <Zap className="h-2.5 w-2.5" /> Urgente
          </span>
        )}
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
          {REGIME_LABEL[vaga.regime as Regime] ?? vaga.regime}
        </span>
      </div>

      <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight">{vaga.titulo}</h2>
      <div className="mt-1 flex items-center gap-2">
        {vaga.empresa_logo_url ? (
          <img src={vaga.empresa_logo_url} alt={vaga.empresa_nome} className="h-6 w-6 rounded-md object-cover" />
        ) : (
          <div className="grid h-6 w-6 place-items-center rounded-md bg-secondary text-muted-foreground"><Building2 className="h-3.5 w-3.5" /></div>
        )}
        {vaga.empresa_slug_publico ? (
          <Link to="/c/$slug" params={{ slug: vaga.empresa_slug_publico }} className="text-sm font-semibold text-muted-foreground hover:text-primary hover:underline">
            {vaga.empresa_nome}
          </Link>
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">{vaga.empresa_nome}</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-3 text-sm">
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0 text-muted-foreground" /> {vaga.bairro}, {vaga.cidade}</span>
        <span className="inline-flex items-center gap-1.5 font-bold text-success"><Wallet className="h-4 w-4 shrink-0" /> {vaga.salario}</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" /> {vaga.horario}</span>
      </div>

      <div className="mt-4">
        <VagaActions vaga={vaga} empresaId={vaga.empresa_id} />
      </div>

      {vaga.descricao && (
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Sobre a vaga</h3>
          <p className="mt-1.5 whitespace-pre-line text-sm text-foreground">{vaga.descricao}</p>
        </div>
      )}

      {vaga.requisitos.length > 0 && (
        <div className="mt-5">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" /> Requisitos
          </h3>
          <ul className="mt-1.5 space-y-1 text-sm">
            {vaga.requisitos.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />{r}</li>
            ))}
          </ul>
        </div>
      )}

      {vaga.faixa_salarial_sugerida && (
        <p className="mt-4 text-xs text-muted-foreground">Faixa de mercado: {vaga.faixa_salarial_sugerida}</p>
      )}

      <p className="mt-5 text-[11px] text-muted-foreground">Publicada {tempoRelativo(vaga.created_at)}</p>
    </div>
  );
}
