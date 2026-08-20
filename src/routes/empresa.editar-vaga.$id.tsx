import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ArrowLeft, Zap, Loader2 } from "lucide-react";
import { PROFISSOES } from "@/lib/mock-data";
import { gerarDescricaoVaga } from "@/lib/ai.functions";
import { geocodificarEndereco, sugerirSalarioFaixa } from "@/lib/intel.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { pingVagaSlug } from "@/lib/google-indexing.functions";
import { VagaFormFields, type VagaForm } from "@/components/VagaFormFields";
import { toast } from "sonner";

export const Route = createFileRoute("/empresa/editar-vaga/$id")({
  head: () => ({
    meta: [{ title: "Editar vaga — VagasAgora" }, { name: "robots", content: "noindex" }],
  }),
  component: EditarVaga,
});

const FORM_VAZIO: VagaForm = {
  titulo: "", salario: "", horario: "", bairro: "Centro", cidade: "São Paulo",
  endereco: "", profissao: PROFISSOES[0].nome, regime: "clt", urgente: false,
  descricao: "", requisitos: [], raioKm: "",
};

function EditarVaga() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<VagaForm>(FORM_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [erroIA, setErroIA] = useState<string | null>(null);
  const [faixaSugerida, setFaixaSugerida] = useState<{ min: number; medio: number; max: number; fonte: string } | null>(null);
  const [profissaoSlugOriginal, setProfissaoSlugOriginal] = useState<string | null>(null);
  const [cidadeOriginal, setCidadeOriginal] = useState<string | null>(null);

  const upd = <K extends keyof VagaForm>(k: K, v: VagaForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("vagas")
        .select("titulo,salario,horario,bairro,cidade,endereco,profissao,profissao_slug,regime,urgente,descricao,requisitos,raio_km,empresa_id")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        setErroCarga("Vaga não encontrada");
        setCarregando(false);
        return;
      }
      if (data.empresa_id !== user.id) {
        setErroCarga("Você não tem permissão para editar esta vaga");
        setCarregando(false);
        return;
      }
      setForm({
        titulo: data.titulo,
        salario: data.salario,
        horario: data.horario,
        bairro: data.bairro,
        cidade: data.cidade,
        endereco: data.endereco ?? "",
        profissao: data.profissao,
        regime: data.regime as VagaForm["regime"],
        urgente: data.urgente,
        descricao: data.descricao ?? "",
        requisitos: Array.isArray(data.requisitos) ? (data.requisitos as unknown[]).map(String) : [],
        raioKm: data.raio_km != null ? String(data.raio_km) : "",
      });
      setProfissaoSlugOriginal(data.profissao_slug);
      setCidadeOriginal(data.cidade);
      setCarregando(false);
    })();
  }, [user, id]);

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
    if (!user) return;
    setSalvando(true);
    const prof = PROFISSOES.find((p) => p.nome === form.profissao);
    const profissaoSlug = prof?.slug ?? form.profissao.toLowerCase().replace(/\s+/g, "-");

    // Só re-geocodifica se o endereço ou a cidade mudaram (evita chamada desnecessária)
    let geo: { latitude: number | null; longitude: number | null } | null = null;
    if (form.endereco.trim() || form.cidade !== cidadeOriginal) {
      try {
        geo = await geocodificarEndereco({ data: { endereco: form.endereco || `${form.bairro}, ${form.cidade}`, cidade: form.cidade } });
      } catch { /* mantém coords antigas se falhar */ }
    }

    const { error } = await supabase.from("vagas").update({
      regime: form.regime,
      titulo: form.titulo,
      salario: form.salario,
      horario: form.horario,
      bairro: form.bairro,
      cidade: form.cidade,
      endereco: form.endereco || null,
      ...(geo ? { latitude: geo.latitude, longitude: geo.longitude } : {}),
      profissao: form.profissao,
      profissao_slug: profissaoSlug,
      descricao: form.descricao || null,
      requisitos: form.requisitos,
      urgente: form.urgente,
      raio_km: form.raioKm ? parseInt(form.raioKm, 10) : null,
    }).eq("id", id);

    setSalvando(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Vaga atualizada!");

    // Avisa o Google da URL nova E da antiga (se profissão/cidade mudaram, o slug muda)
    const slugNovo = `${profissaoSlug}-em-${form.cidade.toLowerCase().replace(/\s+/g, "-")}`;
    const slugAntigo = profissaoSlugOriginal && cidadeOriginal
      ? `${profissaoSlugOriginal}-em-${cidadeOriginal.toLowerCase().replace(/\s+/g, "-")}`
      : null;
    pingVagaSlug({ data: { slug: slugNovo, type: "URL_UPDATED" } }).catch(() => null);
    if (slugAntigo && slugAntigo !== slugNovo) {
      pingVagaSlug({ data: { slug: slugAntigo, type: "URL_UPDATED" } }).catch(() => null);
    }
    setSaved(true);
  };

  if (carregando) {
    return <div className="mx-auto max-w-2xl py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (erroCarga) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <p className="font-bold text-destructive">{erroCarga}</p>
        <Link to="/empresa/minhas-vagas" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
          Voltar pras minhas vagas
        </Link>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold">Vaga atualizada!</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/empresa/minhas-vagas" className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            Minhas vagas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/empresa/minhas-vagas" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-extrabold">Editar vaga</h1>
      <p className="text-sm text-muted-foreground">Altere o que precisar e salve.</p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <VagaFormFields
          form={form} upd={upd} gerando={gerando} erroIA={erroIA}
          faixaSugerida={faixaSugerida} sugerir={sugerir} consultarSalario={consultarSalario}
        />

        <button type="submit" disabled={salvando} className="btn-touch shadow-pop flex w-full items-center justify-center gap-2 bg-accent text-accent-foreground disabled:opacity-60">
          {salvando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
          {salvando ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>

      <style>{`.input-base { height: 2.75rem; width: 100%; border-radius: 0.75rem; border: 1px solid hsl(var(--border)); background: hsl(var(--background)); padding: 0 0.75rem; font-size: 0.875rem; outline: none; } .input-base:focus { border-color: hsl(var(--primary)); }`}</style>
    </div>
  );
}
