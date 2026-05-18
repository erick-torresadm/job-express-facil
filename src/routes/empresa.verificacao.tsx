import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { getStatusVerificacao, enviarVerificacao } from "@/lib/verificacao.functions";
import { ShieldCheck, Upload, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

const LABELS: Record<string, string> = {
  company_name: "Nome da empresa",
  full_name: "Nome do responsável",
  whatsapp: "WhatsApp",
  cpf_cnpj: "CPF/CNPJ",
  logo_url: "Logo",
  sobre: "Texto sobre a empresa",
  cor_primaria: "Cor primária",
  slug_publico: "Slug da página pública",
};

export const Route = createFileRoute("/empresa/verificacao")({
  head: () => ({ meta: [{ title: "Verificação da empresa — VagasAgora" }, { name: "robots", content: "noindex" }] }),
  component: VerificacaoPage,
});

function VerificacaoPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const fetchStatus = useServerFn(getStatusVerificacao);
  const enviar = useServerFn(enviarVerificacao);

  const [status, setStatus] = useState<Awaited<ReturnType<typeof getStatusVerificacao>> | null>(null);
  const [doc, setDoc] = useState<File | null>(null);
  const [comp, setComp] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/auth" }); return; }
    fetchStatus().then(setStatus);
  }, [user, loading]);

  async function uploadArquivo(file: File, tipo: "documento" | "comprovante") {
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${user!.id}/${tipo}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("verificacao-docs").upload(path, file, { upsert: false });
    if (error) throw new Error(error.message);
    return path;
  }

  async function handleEnviar() {
    if (!doc || !comp) { toast.error("Envie os dois arquivos."); return; }
    setEnviando(true);
    try {
      const [documento_url, comprovante_url] = await Promise.all([
        uploadArquivo(doc, "documento"),
        uploadArquivo(comp, "comprovante"),
      ]);
      await enviar({ data: { documento_url, comprovante_url } });
      toast.success("Enviado pra análise! Avisamos quando aprovar.");
      const novo = await fetchStatus();
      setStatus(novo);
      setDoc(null); setComp(null);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao enviar.");
    } finally {
      setEnviando(false);
    }
  }

  if (!status) return <div className="p-8 text-muted-foreground">Carregando…</div>;

  const pendente = status.ultima_solicitacao?.status === "pendente";
  const rejeitada = status.ultima_solicitacao?.status === "rejeitado";
  const podeEnviar = status.completude === 100 && !status.verificada && !pendente;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Verificação da empresa</h1>
            <p className="text-sm text-muted-foreground">Empresas verificadas atraem até 3x mais candidatos.</p>
          </div>
        </div>
      </header>

      {status.verificada && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" /> Sua empresa já é verificada</div>
          <p className="mt-1 text-sm">O selo aparece nas suas vagas e na sua página pública.</p>
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">1. Complete o perfil ({status.completude}%)</h2>
          <Link to="/empresa/pagina" className="text-sm font-semibold text-accent hover:underline">Editar perfil →</Link>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-accent transition-all" style={{ width: `${status.completude}%` }} />
        </div>
        {status.faltando.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm">
            {status.faltando.map((f) => (
              <li key={f} className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-amber-500" /> Falta: <strong className="text-foreground">{LABELS[f] ?? f}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-bold">2. Envie os documentos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Documento da empresa (cartão CNPJ ou contrato social) + comprovante de endereço dos últimos 90 dias.</p>

        {pendente && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
            <Clock className="h-4 w-4" /> Análise em andamento. Em geral leva até 48h úteis.
          </div>
        )}

        {rejeitada && (
          <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <strong>Sua última solicitação foi recusada.</strong>
            {status.ultima_solicitacao?.motivo_rejeicao && <p className="mt-1">Motivo: {status.ultima_solicitacao.motivo_rejeicao}</p>}
            <p className="mt-1">Corrija e envie novamente abaixo.</p>
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ArquivoInput label="Documento da empresa" file={doc} onChange={setDoc} disabled={!podeEnviar} />
          <ArquivoInput label="Comprovante de endereço" file={comp} onChange={setComp} disabled={!podeEnviar} />
        </div>

        <button
          disabled={!podeEnviar || enviando || !doc || !comp}
          onClick={handleEnviar}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-accent-foreground disabled:opacity-40"
        >
          <Upload className="h-4 w-4" /> {enviando ? "Enviando…" : "Enviar para análise"}
        </button>

        {!podeEnviar && !status.verificada && !pendente && status.completude < 100 && (
          <p className="mt-3 text-xs text-muted-foreground">Complete 100% do perfil para liberar o envio.</p>
        )}
      </section>
    </div>
  );
}

function ArquivoInput({ label, file, onChange, disabled }: { label: string; file: File | null; onChange: (f: File | null) => void; disabled?: boolean }) {
  return (
    <label className={`block cursor-pointer rounded-xl border-2 border-dashed border-border p-4 text-center text-sm hover:border-accent ${disabled ? "pointer-events-none opacity-50" : ""}`}>
      <p className="font-semibold">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{file ? file.name : "PDF, JPG ou PNG até 10MB"}</p>
      <input
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f && f.size > 10 * 1024 * 1024) { toast.error("Arquivo maior que 10MB"); return; }
          onChange(f);
        }}
      />
    </label>
  );
}
