import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ArrowLeft, Zap, Loader2 } from "lucide-react";
import { PROFISSOES } from "@/lib/mock-data";
import { gerarDescricaoVaga } from "@/lib/ai.functions";
import {
  geocodificarEndereco, estimarCustoAlimentacao, sugerirSalarioFaixa,
  analisarVagaFraude, gerarPerguntasTriagem,
} from "@/lib/intel.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { notifyAdminsVagaCriada } from "@/lib/admin-notify.functions";
import { pingVagaSlug } from "@/lib/google-indexing.functions";
import { VagaFormFields, type VagaForm } from "@/components/VagaFormFields";
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
  const [form, setForm] = useState<VagaForm>({
    titulo: "",
    salario: "",
    horario: "",
    bairro: "Centro",
    cidade: "São Paulo",
    endereco: "",
    profissao: PROFISSOES[0].nome,
    regime: "clt",
    urgente: false,
    descricao: "",
    requisitos: [],
    raioKm: "",
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
      raio_km: form.raioKm ? parseInt(form.raioKm, 10) : null,
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
    const slug = `${prof?.slug ?? form.profissao.toLowerCase().replace(/\s+/g, "-")}-em-${form.cidade.toLowerCase().replace(/\s+/g, "-")}`;
    notifyAdminsVagaCriada({
      data: {
        titulo: form.titulo,
        empresa: empresaNome,
        cidade: form.cidade,
        slug,
      },
    }).catch(() => null);
    // Google Indexing API — avisa o Google que uma URL de JobPosting foi publicada
    pingVagaSlug({ data: { slug, type: "URL_UPDATED" } }).catch(() => null);
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
        <VagaFormFields
          form={form} upd={upd} gerando={gerando} erroIA={erroIA}
          faixaSugerida={faixaSugerida} sugerir={sugerir} consultarSalario={consultarSalario}
        />

        <button type="submit" disabled={salvando} className="btn-touch shadow-pop flex w-full items-center justify-center gap-2 bg-accent text-accent-foreground disabled:opacity-60">
          {salvando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
          {salvando ? "Publicando…" : "Publicar vaga"}
        </button>
      </form>

      <style>{`.input-base { height: 2.75rem; width: 100%; border-radius: 0.75rem; border: 1px solid hsl(var(--border)); background: hsl(var(--background)); padding: 0 0.75rem; font-size: 0.875rem; outline: none; } .input-base:focus { border-color: hsl(var(--primary)); }`}</style>
    </div>
  );
}
