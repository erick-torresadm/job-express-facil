import { useState, useMemo } from "react";
import { CANDIDATOS, PROFISSOES, BAIRROS, type Candidato } from "@/lib/mock-data";
import { MapPin, Phone, Check, X, Clock, Star, Search, Sparkles, Zap } from "lucide-react";

export function CandidatosList() {
  const [bairro, setBairro] = useState<string>("todos");
  const [profissao, setProfissao] = useState<string>("todas");
  const [idadeMax, setIdadeMax] = useState<number>(60);
  const [status, setStatus] = useState<Record<string, Candidato["status"]>>(() =>
    Object.fromEntries(CANDIDATOS.map((c) => [c.id, c.status]))
  );
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    return CANDIDATOS
      .filter((c) => bairro === "todos" || c.bairro === bairro)
      .filter((c) => profissao === "todas" || c.profissoes.some((p) => p.toLowerCase().includes(profissao.toLowerCase())))
      .filter((c) => c.idade <= idadeMax)
      .filter((c) => !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) || c.resumo.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => Number(b.destaque ?? false) - Number(a.destaque ?? false));
  }, [bairro, profissao, idadeMax, busca]);

  const setStat = (id: string, s: Candidato["status"]) => setStatus((m) => ({ ...m, [id]: s }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Candidatos disponíveis</h1>
          <p className="text-sm text-muted-foreground">{filtrados.length} perfis processados por IA</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-pop">
          <Sparkles className="h-4 w-4" /> Match IA (10 melhores)
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou experiência…"
            className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <Select label="Bairro" value={bairro} onChange={setBairro}
          options={[{ v: "todos", l: "Todos os bairros" }, ...BAIRROS.map((b) => ({ v: b, l: b }))]} />
        <Select label="Profissão" value={profissao} onChange={setProfissao}
          options={[{ v: "todas", l: "Todas" }, ...PROFISSOES.map((p) => ({ v: p.nome, l: p.nome }))]} />
        <div>
          <label className="text-xs font-bold uppercase text-muted-foreground">Idade até {idadeMax}</label>
          <input type="range" min={18} max={65} value={idadeMax} onChange={(e) => setIdadeMax(Number(e.target.value))}
            className="mt-2 w-full accent-primary" />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtrados.map((c) => (
          <article key={c.id} className="relative rounded-2xl border border-border bg-card p-5 shadow-soft">
            {c.destaque && (
              <span className="absolute -top-2 right-4 inline-flex items-center gap-1 rounded-full bg-warning px-2.5 py-1 text-[10px] font-extrabold text-warning-foreground">
                <Zap className="h-3 w-3" /> FUROU FILA
              </span>
            )}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {c.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h3 className="font-extrabold leading-tight">{c.nome}, {c.idade}</h3>
                  <p className="text-xs text-muted-foreground">
                    <MapPin className="mr-1 inline h-3 w-3" /> {c.bairro}, {c.cidade}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.profissoes.map((p) => (
                      <span key={p} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
              <StatusBadge s={status[c.id]} />
            </div>

            <p className="mt-3 text-sm text-muted-foreground">{c.resumo}</p>

            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-bold text-primary">Ver experiências ({c.experiencias.length})</summary>
              <ul className="mt-2 space-y-1 text-sm">
                {c.experiencias.map((e) => <li key={e}>• {e}</li>)}
              </ul>
            </details>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">
                <Phone className="h-3.5 w-3.5" /> {c.telefone}
              </button>
              <div className="flex gap-1.5">
                <ActionBtn label="Aprovar" icon={<Check className="h-3.5 w-3.5" />} tone="accent" active={status[c.id] === "aprovado"} onClick={() => setStat(c.id, "aprovado")} />
                <ActionBtn label="Pendente" icon={<Clock className="h-3.5 w-3.5" />} tone="warning" active={status[c.id] === "pendente"} onClick={() => setStat(c.id, "pendente")} />
                <ActionBtn label="Recusar" icon={<X className="h-3.5 w-3.5" />} tone="destructive" active={status[c.id] === "recusado"} onClick={() => setStat(c.id, "recusado")} />
              </div>
            </div>
            <p className="mt-2 text-[10px] uppercase text-muted-foreground">Cadastrado {c.cadastradoEm}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-2 text-sm outline-none focus:border-primary">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function StatusBadge({ s }: { s: Candidato["status"] }) {
  const map = {
    aprovado: { bg: "bg-accent text-accent-foreground", l: "Aprovado", I: Check },
    pendente: { bg: "bg-warning text-warning-foreground", l: "Pendente", I: Clock },
    recusado: { bg: "bg-destructive/15 text-destructive", l: "Recusado", I: X },
  } as const;
  const cfg = map[s];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.bg}`}>
      <cfg.I className="h-3 w-3" /> {cfg.l}
    </span>
  );
}

function ActionBtn({ label, icon, tone, active, onClick }: { label: string; icon: React.ReactNode; tone: "accent" | "warning" | "destructive"; active: boolean; onClick: () => void }) {
  const tones = {
    accent: active ? "bg-accent text-accent-foreground" : "hover:bg-accent/10 text-accent",
    warning: active ? "bg-warning text-warning-foreground" : "hover:bg-warning/10 text-warning",
    destructive: active ? "bg-destructive text-destructive-foreground" : "hover:bg-destructive/10 text-destructive",
  } as const;
  return (
    <button onClick={onClick} title={label}
      className={`inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-2 text-[11px] font-bold transition-colors ${tones[tone]}`}>
      {icon} {label}
    </button>
  );
}
