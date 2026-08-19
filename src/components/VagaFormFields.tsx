import { Wand2, Loader2, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { BAIRROS, PROFISSOES } from "@/lib/mock-data";

export type VagaForm = {
  titulo: string;
  salario: string;
  horario: string;
  bairro: string;
  cidade: string;
  endereco: string;
  profissao: string;
  regime: "clt" | "pj" | "estagio" | "outros";
  urgente: boolean;
  descricao: string;
  requisitos: string[];
  raioKm: string;
};

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function VagaFormFields({
  form, upd, gerando, erroIA, faixaSugerida, sugerir, consultarSalario,
}: {
  form: VagaForm;
  upd: <K extends keyof VagaForm>(k: K, v: VagaForm[K]) => void;
  gerando: boolean;
  erroIA: string | null;
  faixaSugerida: { min: number; medio: number; max: number; fonte: string } | null;
  sugerir: () => void;
  consultarSalario: () => void;
}) {
  return (
    <>
      <Field label="Título da vaga">
        <input required value={form.titulo} onChange={(e) => upd("titulo", e.target.value)} placeholder="Ex: Pedreiro de acabamento" className="input-base" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Salário">
          <input required value={form.salario} onChange={(e) => upd("salario", e.target.value)} placeholder="R$ 2.500 + benefícios" className="input-base" />
          <button type="button" onClick={consultarSalario} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <TrendingUp className="h-3 w-3" /> Ver faixa de mercado
          </button>
          {faixaSugerida && (
            <p className="mt-1 text-xs text-muted-foreground">
              Mercado: <strong>R$ {faixaSugerida.min}–{faixaSugerida.max}</strong> (médio R$ {faixaSugerida.medio})
            </p>
          )}
        </Field>
        <Field label="Horário"><input required value={form.horario} onChange={(e) => upd("horario", e.target.value)} placeholder="Seg–Sex, 7h às 17h" className="input-base" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Profissão">
          <select value={form.profissao} onChange={(e) => upd("profissao", e.target.value)} className="input-base">
            {PROFISSOES.map((p) => <option key={p.id}>{p.nome}</option>)}
          </select>
        </Field>
        <Field label="Bairro">
          <select value={form.bairro} onChange={(e) => upd("bairro", e.target.value)} className="input-base">
            {BAIRROS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Cidade">
          <input value={form.cidade} onChange={(e) => upd("cidade", e.target.value)} className="input-base" />
        </Field>
      </div>

      <Field label="Regime de contratação">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            { v: "clt", l: "CLT", d: "Carteira assinada" },
            { v: "pj", l: "PJ", d: "Autônomo/MEI" },
            { v: "estagio", l: "Estágio", d: "Universitário" },
            { v: "outros", l: "Outros", d: "Diária/Freela" },
          ] as const).map((o) => (
            <button key={o.v} type="button" onClick={() => upd("regime", o.v)}
              className={`rounded-xl border-2 p-2.5 text-left transition ${
                form.regime === o.v
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/40"
              }`}>
              <p className="text-sm font-bold">{o.l}</p>
              <p className="text-[10px] text-muted-foreground">{o.d}</p>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Endereço completo (opcional, melhora cálculo de distância)">
        <input value={form.endereco} onChange={(e) => upd("endereco", e.target.value)} placeholder="Rua, número — bairro" className="input-base" />
      </Field>
      <Field label="Raio de alcance desta vaga (km)">
        <input type="number" min={1} max={500} value={form.raioKm} onChange={(e) => upd("raioKm", e.target.value)}
          placeholder="Padrão da empresa" className="input-base" />
        <p className="mt-1 text-[11px] text-muted-foreground">Deixe em branco pra usar o raio padrão da sua empresa (configurável em "Página de captação").</p>
      </Field>
      <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>A IA gera perguntas de pré-triagem, calcula custo de transporte/alimentação pros candidatos e verifica risco de golpe automaticamente.</span>
      </div>

      <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-bold">Texto da vaga</p>
          <button type="button" onClick={sugerir} disabled={gerando}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-60">
            {gerando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            {gerando ? "Gerando…" : "Sugerir texto"}
          </button>
        </div>
        <textarea value={form.descricao} onChange={(e) => upd("descricao", e.target.value)} rows={4} placeholder="Descreva a vaga ou clique em Sugerir texto"
          className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary" />
        {form.requisitos.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {form.requisitos.map((r, i) => <li key={i}>• {r}</li>)}
          </ul>
        )}
        {erroIA && <p className="mt-2 text-xs text-destructive">{erroIA}</p>}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-warning/40 bg-warning/5 p-4">
        <input type="checkbox" checked={form.urgente} onChange={(e) => upd("urgente", e.target.checked)} className="mt-1 h-5 w-5 accent-warning" />
        <div>
          <p className="inline-flex items-center gap-1.5 font-bold"><Zap className="h-4 w-4 text-warning" /> Marcar como URGENTE</p>
          <p className="text-xs text-muted-foreground">Destaque no topo da listagem e prioridade na notificação.</p>
        </div>
      </label>
    </>
  );
}
