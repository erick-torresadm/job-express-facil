import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { listMeusOrcamentos, atualizarStatusOrcamento } from "@/lib/freelas.functions";

export const Route = createFileRoute("/freelancer/orcamentos")({
  component: OrcamentosPage,
});

const STATUS_LABEL: Record<string, string> = {
  novo: "🆕 Novo",
  respondido: "✉️ Respondido",
  fechado: "✅ Fechado",
  perdido: "❌ Perdido",
};

function OrcamentosPage() {
  const qc = useQueryClient();
  const { data: orcamentos = [], isLoading } = useQuery({
    queryKey: ["meus-orcamentos"],
    queryFn: () => listMeusOrcamentos(),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => atualizarStatusOrcamento({ data: { id, status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meus-orcamentos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-muted-foreground">Carregando…</p>;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Pedidos de orçamento</h1>

      {orcamentos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Nenhum orçamento recebido ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {orcamentos.map((o) => (
            <article key={o.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold">{o.nome}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm">{o.descricao}</p>
              <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <span>WhatsApp: <strong className="text-foreground">{o.whatsapp}</strong></span>
                {o.email && <span>E-mail: {o.email}</span>}
                {o.orcamento_alvo && <span>Orçamento-alvo: R$ {o.orcamento_alvo}</span>}
                {o.prazo_dias && <span>Prazo desejado: {o.prazo_dias} dias</span>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/55${o.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${o.nome}, recebi seu pedido no VagasAgora!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-bold text-white"
                >
                  <MessageCircle className="h-3 w-3" /> Responder no WhatsApp
                </a>
                <select
                  value={o.status}
                  onChange={(e) => update.mutate({ id: o.id, status: e.target.value })}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold"
                >
                  <option value="novo">🆕 Novo</option>
                  <option value="respondido">✉️ Respondido</option>
                  <option value="fechado">✅ Fechado</option>
                  <option value="perdido">❌ Perdido</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
