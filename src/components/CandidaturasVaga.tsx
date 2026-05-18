import { useEffect, useState } from "react";
import { ChevronDown, Phone, Eye, Sparkles, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Status = "enviado" | "visto" | "em_analise" | "finalizado";

type Item = {
  id: string;
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

  useEffect(() => {
    if (!open) return;
    supabase.from("candidaturas")
      .select("id,status,respostas,created_at,curriculos(nome,whatsapp,profissao,bairro,cidade,resumo,slug)")
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
                    {c.curriculos?.whatsapp && (
                      <a href={`https://wa.me/55${c.curriculos.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-[11px] font-bold text-accent-foreground">
                        <Phone className="h-3 w-3" /> WhatsApp
                      </a>
                    )}
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
    </div>
  );
}
