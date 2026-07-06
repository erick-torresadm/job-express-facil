import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ArrowLeft, Zap, Wand2, Loader2, ShieldCheck, TrendingUp } from "lucide-react";
import { BAIRROS, PROFISSOES } from "@/lib/mock-data";
import { gerarDescricaoVaga } from "@/lib/ai.functions";
import {
  geocodificarEndereco, estimarCustoAlimentacao, sugerirSalarioFaixa,
  analisarVagaFraude, gerarPerguntasTriagem,
} from "@/lib/intel.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { notifyAdminsVagaCriada } from "@/lib/admin-notify.functions";
import { pingVagaSlug } from "@/lib/google-indexing.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/empresa/nova-vaga")({
  head: () => ({
    meta: [{ title: "Nova vaga — VagasAgora" }, { name: "robots", content: "noindex" }],
  }),
  component: NovaVaga,
});

function NovaVaga() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: "",
    salario: "",
    horario: "",
    bairro: BAIRROS[0],
    cidade: "São Paulo",
    endereco: "",
    profissao: PROFISSOES[0].nome,
    regime: "clt" as "clt" | "pj" | "estagio" | "outros",
    urgente: false,
    descricao: "",
    requisitos: [] as string[],
  });
  const [saved, setSaved] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [erroIA, setErroIA] = useState<string | null>(null);
  const [faixaSugerida, setFaixaSugerida] = useState<{ min: number; medio: number; max: number; fonte: string } | null>(null);

  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const consultarSalario = async () => {
    try {
      const r = await sugerirSalarioFaixa({ data: { profissao: form.profissao, cidade: form.cidade, horario: form.horario } });
      setFaixaSugerida(r);
    } catch { /* silencioso */ }
  };

  const sugerir = async () => {
    setErroIA(null);
    setGerando(true);
    try {
      const r = await gerarDescricaoVaga({
        data: {
          titulo: form.titulo || form.profissao,
          profissao: form.profissao,
          bairro: form.bairro,
          salario: form.salario || "A combinar",
          horario: form.horario || "Comercial",
        },
      });
      setForm((f) => ({ ...f, descricao: r.descricao, requisitos: r.requisitos }));
    } catch (e) {
      setErroIA(e instanceof Error ? e.message : "Erro ao gerar texto");
    } finally {
      setGerando(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Faça login como empresa para publicar");
      navigate({ to: "/auth" });
      return;
    }
    setSalvando(true);
    const prof = PROFISSOES.find((p) => p.nome === form.profissao);
    const { data: profile } = await supabase.from("profiles").select("company_name,full_name").eq("id", user.id).maybeSingle();
    const empresaNome = profile?.company_name || profile?.full_name || "Empresa";

    // Roda IA em paralelo (não bloqueia a publicação se algo falhar)
    const enderecoBusca = form.endereco || `${form.bairro}, ${form.cidade}`;
    const [geo, fraude, triagem, alim, faixa] = await Promise.allSettled([
      geocodificarEndereco({ data: { endereco: enderecoBusca, cidade: form.cidade } }),
      analisarVagaFraude({ data: { titulo: form.titulo, descricao: form.descricao || form.titulo, salario: form.salario, empresa: empresaNome } }),
      gerarPerguntasTriagem({ data: { titulo: form.titulo, profissao: form.profissao, descricao: form.descricao } }),
      estimarCustoAlimentacao({ data: { bairro: form.bairro, cidade: form.cidade } }),
      sugerirSalarioFaixa({ data: { profissao: form.profissao, cidade: form.cidade, horario: form.horario } }),
    ]);

    const geoData = geo.status === "fulfilled" ? geo.value : null;
    const fraudeData = fraude.status === "fulfilled" ? fraude.value : null;
    const triagemData = triagem.status === "fulfilled" ? triagem.value : null;
    const alimData = alim.status === "fulfilled" ? alim.value : null;
    const faixaData = faixa.status === "fulfilled" ? faixa.value : null;

    const { error } = await supabase.from("vagas").insert({
      empresa_id: user.id,
      regime: form.regime,
      titulo: form.titulo,
      empresa_nome: empresaNome,
      salario: form.salario,
      horario: form.horario,
      bairro: form.bairro,
      cidade: form.cidade,
      endereco: form.endereco || null,
      latitude: geoData?.latitude ?? null,
      longitude: geoData?.longitude ?? null,
      profissao: form.profissao,
      profissao_slug: prof?.slug ?? form.profissao.toLowerCase().replace(/\s+/g, "-"),
      descricao: form.descricao || null,
      requisitos: form.requisitos,
      urgente: form.urgente,
      ativa: true,
      perguntas_triagem: triagemData?.perguntas ?? [],
      risco_fraude: fraudeData?.risco ?? 0,
      risco_motivo: fraudeData?.motivos?.join("; ") ?? null,
      custo_alimentacao_mes: alimData?.mensal_medio ?? null,
      faixa_salarial_sugerida: faixaData ? `R$ ${faixaData.min}–${faixaData.max} (médio R$ ${faixaData.medio})` : null,
    });
    setSalvando(false);
    if (error) {
      toast.error("Erro ao publicar: " + error.message);
      return;
    }
    if (fraudeData && fraudeData.risco >= 70) {
      toast.warning("Vaga publicada mas marcada como suspeita pela IA. Revise.");
    } else {
      toast.success("Vaga publicada!");
    }
    // Push aos admins (fire-and-forget)
    notifyAdminsVagaCriada({
      data: {
        titulo: form.titulo,
        empresa: empresaNome,
        cidade: form.cidade,
        slug: `${prof?.slug ?? form.profissao.toLowerCase().replace(/\s+/g, "-")}-em-${form.cidade.toLowerCase().replace(/\s+/g, "-")}`,
      },
    }).catch(() => null);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold">Vaga publicada!</h2>
        <p className="mt-1 text-sm text-muted-foreground">Candidatos da região foram notificados.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/empresa" className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            Ver candidatos
          </Link>
          <Link to="/empresa/minhas-vagas" className="rounded-xl bg-secondary px-5 py-3 text-sm font-bold">
            Minhas vagas
          </Link>
        </div>
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

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
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
        <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>Ao publicar, a IA gera 3 perguntas de pré-triagem, calcula custo de transporte/alimentação pros candidatos e verifica risco de golpe automaticamente.</span>
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

        <button type="submit" disabled={salvando} className="btn-touch shadow-pop flex w-full items-center justify-center gap-2 bg-accent text-accent-foreground disabled:opacity-60">
          {salvando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
          {salvando ? "Publicando…" : "Publicar vaga"}
        </button>
      </form>

      <style>{`.input-base { height: 2.75rem; width: 100%; border-radius: 0.75rem; border: 1px solid hsl(var(--border)); background: hsl(var(--background)); padding: 0 0.75rem; font-size: 0.875rem; outline: none; } .input-base:focus { border-color: hsl(var(--primary)); }`}</style>
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
