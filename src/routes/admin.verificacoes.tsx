import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listarVerificacoesAdmin, revisarVerificacao } from "@/lib/verificacao.functions";
import { ExternalLink, Check, X } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/AdminShell";

type Item = Awaited<ReturnType<typeof listarVerificacoesAdmin>>[number];

export const Route = createFileRoute("/admin/verificacoes")({
  head: () => ({ meta: [{ title: "Admin · Verificações" }, { name: "robots", content: "noindex" }] }),
  component: AdminVerificacoes,
});

function AdminVerificacoes() {
  const listar = useServerFn(listarVerificacoesAdmin);
  const revisar = useServerFn(revisarVerificacao);
  const [items, setItems] = useState<Item[] | null>(null);
  const [filtro, setFiltro] = useState<"pendente" | "aprovado" | "rejeitado" | "todos">("pendente");

  useEffect(() => {
    listar().then(setItems).catch((e: Error) => toast.error(e.message ?? "Sem acesso"));
  }, [listar]);

  async function acao(id: string, tipo: "aprovar" | "rejeitar") {
    let motivo: string | undefined;
    if (tipo === "rejeitar") {
      const m = prompt("Motivo da recusa (será enviado para a empresa):");
      if (m === null) return;
      motivo = m.trim() || undefined;
    }
    try {
      await revisar({ data: { id, acao: tipo, motivo } });
      toast.success(tipo === "aprovar" ? "Aprovada ✅" : "Recusada");
      setItems(await listar());
    } catch (e) {
      const err = e as Error;
      toast.error(err.message ?? "Erro");
    }
  }

  return (
    <AdminShell title="Verificações de empresas">
      <div className="flex gap-2">
        {(["pendente", "aprovado", "rejeitado", "todos"] as const).map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider capitalize ${
              filtro === f ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground"
            }`}>
            {f} {f !== "todos" && items && `(${items.filter(i => i.status === f).length})`}
          </button>
        ))}
      </div>

      {!items && <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>}
      {items && (() => {
        const filtrados = filtro === "todos" ? items : items.filter((i) => i.status === filtro);
        if (filtrados.length === 0) {
          return <p className="mt-6 rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Nada por aqui.</p>;
        }
        return (
          <div className="mt-5 space-y-3">
            {filtrados.map((it) => (
              <article key={it.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold">{it.empresa?.company_name ?? "(sem nome)"}</h2>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        it.status === "pendente" ? "bg-warning/15 text-warning"
                        : it.status === "aprovado" ? "bg-accent/15 text-accent"
                        : "bg-destructive/15 text-destructive"
                      }`}>{it.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {it.empresa?.full_name} · {it.empresa?.whatsapp} · CNPJ: {it.empresa?.cpf_cnpj}
                    </p>
                    <p className="text-xs text-muted-foreground">Enviado em {new Date(it.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  {it.status === "pendente" && (
                    <div className="flex gap-2">
                      <button onClick={() => acao(it.id, "aprovar")} className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm font-bold text-accent-foreground">
                        <Check className="h-4 w-4" /> Aprovar
                      </button>
                      <button onClick={() => acao(it.id, "rejeitar")} className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-2 text-sm font-bold text-destructive-foreground">
                        <X className="h-4 w-4" /> Recusar
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {it.documento_signed_url && (
                    <a href={it.documento_signed_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                      <ExternalLink className="h-3 w-3" /> Documento
                    </a>
                  )}
                  {it.comprovante_signed_url && (
                    <a href={it.comprovante_signed_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                      <ExternalLink className="h-3 w-3" /> Comprovante
                    </a>
                  )}
                  {it.empresa?.slug_publico && (
                    <a href={`/c/${it.empresa.slug_publico}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                      <ExternalLink className="h-3 w-3" /> Página pública
                    </a>
                  )}
                </div>

                {it.motivo_rejeicao && <p className="mt-3 text-sm text-destructive">Motivo: {it.motivo_rejeicao}</p>}
              </article>
            ))}
          </div>
        );
      })()}
    </AdminShell>
  );
}
