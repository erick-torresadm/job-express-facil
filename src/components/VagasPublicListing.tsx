import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Search, MapPin, Briefcase, Zap, ArrowRight, X, Navigation, Loader2,
  Wallet, Clock3, SlidersHorizontal, Building2, ListChecks, Bell, BellOff,
  Share2, MessageCircleQuestion, ChevronDown, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listarVagasPublicas, type VagaPublica } from "@/lib/vagas.functions";
import { VagaActions } from "@/components/VagaActions";
import { FraudBadge } from "@/components/VagaCards";
import { useAuth } from "@/hooks/use-auth";

type Regime = "clt" | "pj" | "estagio" | "outros";

export type { VagaPublica };

/**
 * Filtros vivem na URL: F5, voltar/avançar e link compartilhado preservam a
 * busca. Cada rota de /vagas declara este validateSearch.
 */
export type VagasSearch = {
  q?: string;
  cidade?: string;
  urgente?: boolean;
  perto?: boolean;
  dias?: number;
  salario?: number;
  ordem?: "relevantes" | "recentes" | "perto" | "salario";
};

export function validateVagasSearch(raw: Record<string, unknown>): VagasSearch {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 100) : undefined);
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const ordem = raw.ordem;
  return {
    q: str(raw.q),
    cidade: str(raw.cidade),
    urgente: raw.urgente === true || raw.urgente === "true" ? true : undefined,
    perto: raw.perto === true || raw.perto === "true" ? true : undefined,
    dias: num(raw.dias),
    salario: num(raw.salario),
    ordem:
      ordem === "recentes" || ordem === "perto" || ordem === "salario" || ordem === "relevantes"
        ? ordem
        : undefined,
  };
}

function isNova(iso: string) {
  return Date.now() - new Date(iso).getTime() < 48 * 3600_000;
}

const TABS: Array<{ to: "/vagas" | "/vagas/clt" | "/vagas/pj" | "/vagas/estagio"; label: string; regime: Regime | "todos" }> = [
  { to: "/vagas", label: "Todas", regime: "todos" },
  { to: "/vagas/clt", label: "CLT", regime: "clt" },
  { to: "/vagas/pj", label: "PJ", regime: "pj" },
  { to: "/vagas/estagio", label: "Estágio", regime: "estagio" },
];

const REGIME_LABEL: Record<Regime, string> = {
  clt: "CLT", pj: "PJ", estagio: "Estágio", outros: "Outros",
};

const PERIODOS = [
  { dias: 1, label: "Hoje" },
  { dias: 3, label: "Últimos 3 dias" },
  { dias: 7, label: "Última semana" },
  { dias: 30, label: "Último mês" },
];

// Faixas pensadas pro nicho operacional (salário mínimo ~R$ 1.5k em 2026).
const FAIXAS_SALARIO = [1500, 2000, 2500, 3000, 4000];

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

/**
 * Salário é texto livre ("R$ 1.850 + VT", "R$ 2.000 a R$ 3.000", "A combinar").
 * Extrai o menor valor plausível pra permitir filtro e ordenação por salário.
 */
function salarioBase(s: string | null | undefined): number | null {
  if (!s) return null;
  const nums = (s.match(/\d[\d.,]*/g) ?? [])
    .map((t) => Number(t.replace(/\.(?=\d{3}\b)/g, "").replace(",", ".")))
    .filter((n) => Number.isFinite(n) && n >= 300 && n <= 100000);
  return nums.length > 0 ? Math.min(...nums) : null;
}

function moeda(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

type BasePath = "/vagas" | "/vagas/clt" | "/vagas/pj" | "/vagas/estagio";

interface Props {
  regime: Regime | "todos";
  titulo: string;
  subtitulo: string;
  /** Rota desta listagem — usada pra reescrever a query sem trocar de página. */
  basePath: BasePath;
}

const PAGINA = 20;

export function VagasPublicListing({ regime, titulo, subtitulo, basePath }: Props) {
  const nav = useNavigate();
  const search = useSearch({ strict: false }) as VagasSearch;

  const q = search.q ?? "";
  const cidade = search.cidade ?? "";
  const urgente = search.urgente ?? false;
  const pertoDeMim = search.perto ?? false;
  const dias = search.dias ?? 0;
  const salarioMin = search.salario ?? 0;
  const ordem = search.ordem ?? "relevantes";

  const patch = (p: Partial<VagasSearch>) => {
    nav({
      to: basePath,
      search: (prev: VagasSearch) => {
        const next: Record<string, unknown> = { ...prev, ...p };
        // Valor vazio some da URL — link compartilhado fica limpo.
        for (const k of Object.keys(next)) {
          const v = next[k];
          if (v === undefined || v === "" || v === false || v === 0) delete next[k];
        }
        return next as VagasSearch;
      },
      replace: true,
      resetScroll: false,
    });
  };

  const [vagas, setVagas] = useState<VagaPublica[] | null>(null);
  const [totalPorRegime, setTotalPorRegime] = useState<Record<Regime | "todos", number>>({
    todos: 0, clt: 0, pj: 0, estagio: 0, outros: 0,
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [sheetAberto, setSheetAberto] = useState(false);
  const [visiveis, setVisiveis] = useState(PAGINA);
  const [selecionada, setSelecionada] = useState<VagaPublica | null>(null);

  const listar = useServerFn(listarVagasPublicas);

  // Busca com debounce: digitar no campo não dispara uma query por tecla.
  const [qInput, setQInput] = useState(q);
  const [cidadeInput, setCidadeInput] = useState(cidade);
  useEffect(() => { setQInput(q); }, [q]);
  useEffect(() => { setCidadeInput(cidade); }, [cidade]);
  useEffect(() => {
    if (qInput === q) return;
    const t = setTimeout(() => patch({ q: qInput || undefined }), 400);
    return () => clearTimeout(t);
  }, [qInput]);
  useEffect(() => {
    if (cidadeInput === cidade) return;
    const t = setTimeout(() => patch({ cidade: cidadeInput || undefined }), 400);
    return () => clearTimeout(t);
  }, [cidadeInput]);

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
      patch({ perto: true, ordem: "perto" });
    } finally {
      setBuscandoLocal(false);
    }
  }

  function desativarPertoDeMim() {
    setCoords(null);
    setErroLocal(null);
    patch({ perto: undefined, ordem: ordem === "perto" ? undefined : ordem });
  }

  // Se a URL veio com perto=true (link compartilhado, F5), pede o GPS de novo.
  useEffect(() => {
    if (pertoDeMim && !coords && !buscandoLocal) void ativarPertoDeMim();
  }, [pertoDeMim]);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setVagas(null);
      const res = await listar({
        data: {
          regime: regime === "todos" ? undefined : regime,
          ...(pertoDeMim && coords ? { lat: coords.lat, lng: coords.lng } : {}),
          q: q.trim() || undefined,
          cidade: !pertoDeMim && cidade.trim() ? cidade.trim() : undefined,
          urgente: urgente || undefined,
          limit: 80,
        },
      });
      if (!cancelado) setVagas(res.vagas as VagaPublica[]);
    })();
    return () => { cancelado = true; };
  }, [regime, q, cidade, urgente, pertoDeMim, coords]);

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

  // Período e salário são refinados no cliente: a API devolve texto livre de
  // salário e não tem filtro por data, e a lista cabe numa página só.
  const { resultado, semSalarioInformado } = useMemo(() => {
    if (!vagas) return { resultado: null as VagaPublica[] | null, semSalarioInformado: 0 };
    let out = vagas;
    if (dias > 0) {
      const corte = Date.now() - dias * 24 * 3600_000;
      out = out.filter((v) => new Date(v.created_at).getTime() >= corte);
    }
    let ocultas = 0;
    if (salarioMin > 0) {
      const antes = out.length;
      out = out.filter((v) => {
        const base = salarioBase(v.salario);
        return base != null && base >= salarioMin;
      });
      ocultas = antes - out.length;
    }
    const ordenado = [...out];
    if (ordem === "recentes") {
      ordenado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (ordem === "perto") {
      ordenado.sort((a, b) => (a.distancia_km ?? 1e9) - (b.distancia_km ?? 1e9));
    } else if (ordem === "salario") {
      ordenado.sort((a, b) => (salarioBase(b.salario) ?? -1) - (salarioBase(a.salario) ?? -1));
    }
    return { resultado: ordenado, semSalarioInformado: ocultas };
  }, [vagas, dias, salarioMin, ordem]);

  useEffect(() => { setVisiveis(PAGINA); }, [q, cidade, urgente, pertoDeMim, dias, salarioMin, ordem, regime]);

  useEffect(() => {
    if (!resultado || resultado.length === 0) { setSelecionada(null); return; }
    if (!selecionada || !resultado.some((v) => v.id === selecionada.id)) setSelecionada(resultado[0]);
  }, [resultado]);

  function abrirVaga(e: React.MouseEvent, v: VagaPublica) {
    e.preventDefault();
    setSelecionada(v);
    if (typeof window !== "undefined" && window.innerWidth < 1024) setSheetAberto(true);
  }

  const activeFilters = [
    q && { k: "q", label: `"${q}"`, clear: () => patch({ q: undefined }) },
    cidade && !pertoDeMim && { k: "c", label: cidade, clear: () => patch({ cidade: undefined }) },
    urgente && { k: "u", label: "Urgente", clear: () => patch({ urgente: undefined }) },
    pertoDeMim && { k: "p", label: "Perto de mim", clear: desativarPertoDeMim },
    dias > 0 && { k: "d", label: PERIODOS.find((p) => p.dias === dias)?.label ?? `${dias} dias`, clear: () => patch({ dias: undefined }) },
    salarioMin > 0 && { k: "s", label: `A partir de ${moeda(salarioMin)}`, clear: () => patch({ salario: undefined }) },
  ].filter(Boolean) as { k: string; label: string; clear: () => void }[];

  const painelFiltros = (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={qInput} onChange={(e) => setQInput(e.target.value)}
          placeholder="Cargo, profissão ou empresa"
          className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
      </label>
      <label className="relative block">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={cidadeInput} onChange={(e) => setCidadeInput(e.target.value)} disabled={pertoDeMim}
          placeholder={pertoDeMim ? "Usando sua localização" : "Cidade"}
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
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Publicação</p>
        <div className="space-y-1">
          {PERIODOS.map((p) => (
            <button key={p.dias} onClick={() => patch({ dias: dias === p.dias ? undefined : p.dias })}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition ${
                dias === p.dias ? "bg-primary font-bold text-primary-foreground" : "text-foreground hover:bg-secondary"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Salário a partir de</p>
        <div className="flex flex-wrap gap-1.5">
          {FAIXAS_SALARIO.map((f) => (
            <button key={f} onClick={() => patch({ salario: salarioMin === f ? undefined : f })}
              className={`rounded-full border px-2.5 py-1 text-xs font-bold transition ${
                salarioMin === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}>
              {moeda(f)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Urgência</p>
        <button onClick={() => patch({ urgente: urgente ? undefined : true })}
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
              <Link key={t.to} to={t.to} search={search}
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

  const ORDENS: Array<{ k: NonNullable<VagasSearch["ordem"]>; label: string; only?: boolean }> = [
    { k: "relevantes", label: "Relevantes" },
    { k: "recentes", label: "Recentes" },
    { k: "salario", label: "Maior salário" },
    { k: "perto", label: "Mais perto", only: true },
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:py-10">
      <header className="mb-5">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
          <Briefcase className="h-3 w-3" /> Vagas abertas
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{titulo}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitulo}</p>
      </header>

      {/* Busca em destaque — sempre visível, estilo portal de vagas */}
      <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 sm:border-r sm:border-border">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input value={qInput} onChange={(e) => setQInput(e.target.value)}
            placeholder="O quê? Cargo, profissão ou empresa"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
        <label className="flex flex-1 items-center gap-2 px-3 py-2.5">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input value={cidadeInput} onChange={(e) => setCidadeInput(e.target.value)} disabled={pertoDeMim}
            placeholder={pertoDeMim ? "Usando sua localização" : "Onde? Cidade ou bairro"}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50" />
        </label>
        <button onClick={() => (pertoDeMim ? desativarPertoDeMim() : ativarPertoDeMim())} disabled={buscandoLocal}
          className={`btn-touch shrink-0 gap-1.5 px-5 sm:w-auto ${pertoDeMim ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
          {buscandoLocal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          {pertoDeMim ? "Perto de mim" : "Perto de mim"}
        </button>
      </div>

      <button
        onClick={() => setFiltrosAbertos(true)}
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold lg:hidden"
      >
        <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filtros</span>
        {activeFilters.length > 0 && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{activeFilters.length}</span>
        )}
      </button>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(340px,1fr)_minmax(0,1.15fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-soft">
            {painelFiltros}
          </div>
        </aside>

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
                Ver {resultado?.length ?? ""} vaga{resultado?.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="min-w-0">
          {resultado === null ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
              ))}
            </div>
          ) : resultado.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
              <p className="text-base font-bold">Nenhuma vaga com esses filtros</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeFilters.length > 0
                  ? "Tente tirar um filtro ou ampliar a busca."
                  : "Cadastre-se grátis pra ser avisado quando abrir vaga nova na sua região."}
              </p>
              {activeFilters.length > 0 && (
                <button onClick={() => nav({ to: basePath, search: {}, replace: true })}
                  className="mt-4 inline-flex rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-bold">
                  Limpar todos os filtros
                </button>
              )}
              <AlertaDaBusca q={q} cidade={cidade} className="mt-4" />
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  <strong className="text-foreground">{resultado.length}</strong> vaga{resultado.length > 1 ? "s" : ""} encontrada{resultado.length > 1 ? "s" : ""}
                </span>
                <div className="flex flex-wrap gap-1 text-xs font-bold">
                  {ORDENS.filter((o) => !o.only || pertoDeMim).map((o) => (
                    <button key={o.k} onClick={() => patch({ ordem: o.k === "relevantes" ? undefined : o.k })}
                      className={`rounded-full px-2.5 py-1 transition ${
                        ordem === o.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {semSalarioInformado > 0 && (
                <p className="mb-3 rounded-lg bg-secondary/60 px-3 py-2 text-[11px] text-muted-foreground">
                  {semSalarioInformado} vaga{semSalarioInformado > 1 ? "s" : ""} oculta{semSalarioInformado > 1 ? "s" : ""} por não informar salário ou pagar abaixo do filtro.
                </p>
              )}

              <ul className="space-y-3">
                {resultado.slice(0, visiveis).map((v) => (
                  <li key={v.id}>
                    <Link
                      to="/vagas/$slug"
                      params={{ slug: `${v.profissao_slug}-em-${slugCidade(v.cidade)}` }}
                      onClick={(e) => abrirVaga(e, v)}
                      className={`group block rounded-2xl border p-4 shadow-soft transition hover:border-primary/50 hover:shadow-pop ${
                        selecionada?.id === v.id ? "border-primary bg-primary/5 lg:ring-1 lg:ring-primary/30" : "border-border bg-card"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary text-muted-foreground">
                          {v.empresa_logo_url ? (
                            <img src={v.empresa_logo_url} alt={v.empresa_nome} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {isNova(v.created_at) && (
                              <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent">Nova</span>
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
                          <h2 className="mt-1.5 text-lg font-bold leading-tight tracking-tight group-hover:text-primary">
                            {v.titulo}
                          </h2>
                          <p className="truncate text-sm text-muted-foreground">{v.empresa_nome}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" /> {v.bairro}, {v.cidade}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-bold text-success">
                          <Wallet className="h-3.5 w-3.5 shrink-0" /> {v.salario}
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

              {visiveis < resultado.length && (
                <button onClick={() => setVisiveis((n) => n + PAGINA)}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 text-sm font-bold hover:border-primary">
                  Ver mais {Math.min(PAGINA, resultado.length - visiveis)} vagas <ChevronDown className="h-4 w-4" />
                </button>
              )}

              <AlertaDaBusca q={q} cidade={cidade} className="mt-4" />
            </>
          )}
        </div>

        {/* Detalhe — desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            {resultado === null ? (
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

      {/* Detalhe — mobile, em folha deslizante */}
      {sheetAberto && selecionada && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSheetAberto(false)} />
          <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-background p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="mx-auto h-1 w-10 rounded-full bg-border" />
              <button onClick={() => setSheetAberto(false)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <VagaDetalhe vaga={selecionada} semScroll />
          </div>
        </div>
      )}

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

/** Cria alerta a partir dos filtros da busca atual — o candidato não perde a vaga nova. */
function AlertaDaBusca({ q, cidade, className = "" }: { q: string; cidade: string; className?: string }) {
  const { user } = useAuth();
  const [existe, setExiste] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const profissao = q.trim() || "Todas as profissões";
  const cid = cidade.trim() || "Todas as cidades";

  useEffect(() => {
    if (!user) return;
    supabase.from("alertas").select("id")
      .eq("user_id", user.id).eq("ativo", true)
      .ilike("profissao", profissao).ilike("cidade", cid)
      .maybeSingle().then(({ data }) => setExiste(data?.id ?? null));
  }, [user, profissao, cid]);

  const toggle = async () => {
    if (!user) { toast.info("Entre para criar alertas de vagas"); return; }
    setLoading(true);
    try {
      if (existe) {
        await supabase.from("alertas").delete().eq("id", existe);
        setExiste(null);
        toast.success("Alerta removido");
      } else {
        const { data } = await supabase.from("alertas")
          .insert({ user_id: user.id, profissao, cidade: cid, ativo: true })
          .select("id").single();
        setExiste(data?.id ?? null);
        toast.success("Alerta criado! Avisamos quando entrar vaga nova.");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-4 ${className}`}>
      <div className="min-w-0">
        <p className="text-sm font-bold">Avisar quando entrar vaga nova</p>
        <p className="truncate text-xs text-muted-foreground">{profissao} · {cid}</p>
      </div>
      {user ? (
        <button onClick={toggle} disabled={loading}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${
            existe ? "border border-border bg-card text-muted-foreground" : "bg-accent text-accent-foreground"
          }`}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : existe ? <><BellOff className="h-3.5 w-3.5" /> Remover</> : <><Bell className="h-3.5 w-3.5" /> Criar alerta</>}
        </button>
      ) : (
        <Link to="/auth" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-foreground">
          <Bell className="h-3.5 w-3.5" /> Entrar pra criar
        </Link>
      )}
    </div>
  );
}

function VagaDetalhe({ vaga, semScroll }: { vaga: VagaPublica; semScroll?: boolean }) {
  const compartilhar = async () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/vagas/${vaga.profissao_slug}-em-${slugCidade(vaga.cidade)}`
      : "";
    const texto = `${vaga.titulo} • ${vaga.empresa_nome} • ${vaga.salario} • ${vaga.bairro}, ${vaga.cidade}\n${url}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: vaga.titulo, text: texto, url }); return; } catch { /* cancelado */ }
    }
    await navigator.clipboard.writeText(texto);
    toast.success("Link copiado");
  };

  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6 ${semScroll ? "" : "max-h-[calc(100vh-7rem)] overflow-y-auto"}`}>
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
        {vaga.distancia_km != null && (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-secondary-foreground">
            <Navigation className="h-2.5 w-2.5" /> {vaga.distancia_km} km de você
          </span>
        )}
        <FraudBadge risco={vaga.risco_fraude} />
      </div>

      <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight">{vaga.titulo}</h2>
      <div className="mt-1.5 flex items-center gap-2">
        {vaga.empresa_logo_url ? (
          <img src={vaga.empresa_logo_url} alt={vaga.empresa_nome} className="h-7 w-7 rounded-md object-cover" />
        ) : (
          <div className="grid h-7 w-7 place-items-center rounded-md bg-secondary text-muted-foreground"><Building2 className="h-4 w-4" /></div>
        )}
        {vaga.empresa_slug_publico ? (
          <Link to="/c/$slug" params={{ slug: vaga.empresa_slug_publico }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary hover:underline">
            {vaga.empresa_nome} <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">{vaga.empresa_nome}</span>
        )}
      </div>

      <div className="mt-4 grid gap-2 rounded-xl bg-secondary/50 p-3 text-sm sm:grid-cols-2">
        <span className="inline-flex items-center gap-1.5 font-bold text-success"><Wallet className="h-4 w-4 shrink-0" /> {vaga.salario}</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" /> {vaga.horario}</span>
        <span className="inline-flex items-center gap-1.5 sm:col-span-2">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" /> {vaga.endereco || `${vaga.bairro}, ${vaga.cidade}`}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <VagaActions vaga={vaga} empresaId={vaga.empresa_id} compact />
        <button onClick={compartilhar} title="Compartilhar"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-card hover:border-primary">
          <Share2 className="h-4 w-4" />
        </button>
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
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {vaga.perguntas_triagem.length > 0 && (
        <div className="mt-5 rounded-xl border border-border bg-secondary/40 p-3">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <MessageCircleQuestion className="h-3.5 w-3.5" /> Ao se candidatar, a empresa pergunta
          </h3>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            {vaga.perguntas_triagem.map((p, i) => <li key={i}>{i + 1}. {p}</li>)}
          </ul>
        </div>
      )}

      {vaga.faixa_salarial_sugerida && (
        <p className="mt-4 text-xs text-muted-foreground">Faixa de mercado da região: {vaga.faixa_salarial_sugerida}</p>
      )}

      <p className="mt-5 text-[11px] text-muted-foreground">Publicada {tempoRelativo(vaga.created_at)}</p>
    </div>
  );
}
