import { useEffect, useState } from "react";
import { ChevronDown, Phone, Eye, Sparkles, CheckCircle2, Clock, Loader2, CalendarCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { chamarPraEntrevista } from "@/lib/entrevista.functions";
import { toast } from "sonner";

type Status = "enviado" | "visto" | "em_analise" | "finalizado";

type Item = {
  id: string;
  candidato_id: string;
  status: Status;
  respostas: { pergunta: string; resposta: string }[];
  created_at: string;
  curriculos: {
    nome: string; whatsapp: string | null; profissao: string; bairro: string | null;
    cidade: string | null; resumo: string; slug: string;
  } | null;
};

const LABEL: Record<Status, string> = { enviado: "Enviada", visto: "Visualizada", em_analise: "Em análise", finalizado: "Finalizada" };
const ICON: Record<Status, typeof Clock> = { enviado: Clock, visto: Eye, em_analise: Sparkles, finalizado: CheckCircle2 };

export function CandidaturasVaga({ vagaId, empresaId }: { vagaId: string; empresaId: string }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [open, setOpen] = useState(false);
  const [entrevistaAberta, setEntrevistaAberta] = useState<{ candidatoId: string; nome: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    supabase.from("candidaturas")
      .select("id,candidato_id,status,respostas,created_at,curriculos(nome,whatsapp,profissao,bairro,cidade,resumo,slug)")
      .eq("vaga_id", vagaId).eq("empresa_id", empresaId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as unknown as Item[]));
  }, [open, vagaId, empresaId]);

  const setStatus = async (id: string, status: Status) => {
    setItems((p) => p?.map((i) => (i.id === id ? { ...i, status } : i)) ?? null);
    const { error } = await supabase.from("candidaturas").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Status atualizado");
  };

  return (
    <div className="mt-2 border-t border-border pt-2">
      <button onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-xs font-bold text-primary">
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
        {open ? "Ocultar candidaturas" : "Ver candidaturas recebidas"}
      </button>
      {open && (
        items === null ? <div className="py-4 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>
        : items.length === 0 ? <p className="py-3 text-xs text-muted-foreground">Nenhuma candidatura ainda.</p>
        : <ul className="mt-3 space-y-2">
            {items.map((c) => {
              const I = ICON[c.status];
              return (
                <li key={c.id} className="rounded-xl border border-border bg-secondary p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{c.curriculos?.nome}</p>
                      <p className="text-[11px] text-muted-foreground">{c.curriculos?.profissao} • {c.curriculos?.bairro}, {c.curriculos?.cidade}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {c.curriculos?.whatsapp && (
                        <a href={`https://wa.me/55${c.curriculos.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-[11px] font-bold text-accent-foreground">
                          <Phone className="h-3 w-3" /> WhatsApp
                        </a>
                      )}
                      <button
                        onClick={() => setEntrevistaAberta({ candidatoId: c.candidato_id, nome: c.curriculos?.nome ?? "Candidato" })}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-bold text-primary-foreground">
                        <CalendarCheck className="h-3 w-3" /> Chamar pra entrevista
                      </button>
                    </div>
                  </div>
                  {c.respostas?.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-[11px] font-bold text-primary">Ver respostas da triagem</summary>
                      <div className="mt-1 space-y-1">
                        {c.respostas.map((r, i) => (
                          <div key={i} className="text-xs">
                            <p className="font-semibold">{r.pergunta}</p>
                            <p className="text-muted-foreground">{r.resposta || "—"}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(["enviado", "visto", "em_analise", "finalizado"] as Status[]).map((s) => {
                      const Si = ICON[s];
                      const active = c.status === s;
                      return (
                        <button key={s} onClick={() => setStatus(c.id, s)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${
                            active ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-secondary"
                          }`}>
                          <Si className="h-3 w-3" /> {LABEL[s]}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
      )}
      {entrevistaAberta && (
        <ModalEntrevista
          candidatoId={entrevistaAberta.candidatoId}
          candidatoNome={entrevistaAberta.nome}
          vagaId={vagaId}
          onClose={() => setEntrevistaAberta(null)}
        />
      )}
    </div>
  );
}

function ModalEntrevista({ candidatoId, candidatoNome, vagaId, onClose }: {
  candidatoId: string; candidatoNome: string; vagaId: string; onClose: () => void;
}) {
  const chamar = useServerFn(chamarPraEntrevista);
  const [tipo, setTipo] = useState<"presencial" | "online">("presencial");
  const [data, setData] = useState("");
  const [linkVideo, setLinkVideo] = useState("");
  const [instrucoes, setInstrucoes] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (!data) { toast.error("Escolha a data e horário"); return; }
    setEnviando(true);
    try {
      const r = await chamar({
        data: {
          candidato_id: candidatoId,
          vaga_id: vagaId,
          tipo,
          data_sugerida: new Date(data).toISOString(),
          link_video: tipo === "online" ? (linkVideo.trim() || undefined) : undefined,
          instrucoes: instrucoes.trim() || undefined,
        },
      });
      if (!r.ok) { toast.error(r.error ?? "Erro ao chamar candidato"); return; }
      toast.success(`${candidatoNome} foi chamado! ${r.email_sent ? "Email enviado." : "Email falhou."} ${r.whatsapp_sent ? "WhatsApp enviado." : ""}`);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao chamar candidato");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold">Chamar {candidatoNome} pra entrevista</h3>
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            {(["presencial", "online"] as const).map((t) => (
              <button key={t} onClick={() => setTipo(t)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-bold ${tipo === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>
                {t === "presencial" ? "Presencial" : "Online"}
              </button>
            ))}
          </div>
          <label className="block text-xs font-bold uppercase text-muted-foreground">
            Data e horário
            <input type="datetime-local" value={data} onChange={(e) => setData(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm normal-case" />
          </label>
          {tipo === "online" && (
            <label className="block text-xs font-bold uppercase text-muted-foreground">
              Link da reunião (opcional)
              <input value={linkVideo} onChange={(e) => setLinkVideo(e.target.value)} placeholder="https://meet.google.com/..."
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm normal-case" />
            </label>
          )}
          <label className="block text-xs font-bold uppercase text-muted-foreground">
            Instruções (opcional)
            <textarea value={instrucoes} onChange={(e) => setInstrucoes(e.target.value)} rows={3}
              className="mt-1 w-full rounded-xl border border-border bg-background p-2 text-sm normal-case" />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-bold">Cancelar</button>
          <button onClick={enviar} disabled={enviando}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
            {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
            {enviando ? "Enviando…" : "Chamar pra entrevista"}
          </button>
        </div>
      </div>
    </div>
  );
}
