import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ArrowLeft, Zap, Wand2, Loader2 } from "lucide-react";
import { BAIRROS, PROFISSOES } from "@/lib/mock-data";
import { gerarDescricaoVaga } from "@/lib/ai.functions";

export const Route = createFileRoute("/empresa/nova-vaga")({
  head: () => ({
    meta: [{ title: "Nova vaga — Vaga Já" }, { name: "robots", content: "noindex" }],
  }),
  component: NovaVaga,
});

function NovaVaga() {
  const [form, setForm] = useState({ titulo: "", salario: "", horario: "", bairro: BAIRROS[0], profissao: PROFISSOES[0].nome, urgente: false });
  const [saved, setSaved] = useState(false);

  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  if (saved) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold">Vaga publicada!</h2>
        <p className="mt-1 text-sm text-muted-foreground">Já notificamos 142 candidatos da região.</p>
        <Link to="/empresa" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
          Voltar pros candidatos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/empresa" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-extrabold">Publicar nova vaga</h1>
      <p className="text-sm text-muted-foreground">Preenchimento em menos de 1 minuto.</p>

      <form onSubmit={(e) => { e.preventDefault(); setSaved(true); }} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <Field label="Título da vaga"><input required value={form.titulo} onChange={(e) => upd("titulo", e.target.value)} placeholder="Ex: Pedreiro de acabamento" className="input" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Salário"><input required value={form.salario} onChange={(e) => upd("salario", e.target.value)} placeholder="R$ 2.500 + benefícios" className="input" /></Field>
          <Field label="Horário"><input required value={form.horario} onChange={(e) => upd("horario", e.target.value)} placeholder="Seg–Sex, 7h às 17h" className="input" /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Profissão">
            <select value={form.profissao} onChange={(e) => upd("profissao", e.target.value)} className="input">
              {PROFISSOES.map((p) => <option key={p.id}>{p.nome}</option>)}
            </select>
          </Field>
          <Field label="Bairro">
            <select value={form.bairro} onChange={(e) => upd("bairro", e.target.value)} className="input">
              {BAIRROS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-warning/40 bg-warning/5 p-4">
          <input type="checkbox" checked={form.urgente} onChange={(e) => upd("urgente", e.target.checked)} className="mt-1 h-5 w-5 accent-warning" />
          <div>
            <p className="font-bold">⚡ Vaga URGENTE +R$ 29</p>
            <p className="text-xs text-muted-foreground">Destaque vermelho no topo da lista, notificação push pra 500+ candidatos da região.</p>
          </div>
        </label>

        <button type="submit" className="btn-touch shadow-pop flex w-full items-center justify-center gap-2 bg-accent text-accent-foreground">
          <Zap className="h-5 w-5" /> Publicar vaga
        </button>
      </form>

      <style>{`.input { @apply h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary; }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
