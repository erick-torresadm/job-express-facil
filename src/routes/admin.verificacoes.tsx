import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { listarVerificacoesAdmin, revisarVerificacao } from "@/lib/verificacao.functions";
import { ShieldCheck, ExternalLink, Check, X } from "lucide-react";
import { toast } from "sonner";

type Item = Awaited<ReturnType<typeof listarVerificacoesAdmin>>[number];

export const Route = createFileRoute("/admin/verificacoes")({
  head: () => ({ meta: [{ title: "Admin · Verificações" }, { name: "robots", content: "noindex" }] }),
  component: AdminVerificacoes,
});

function AdminVerificacoes() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const listar = useServerFn(listarVerificacoesAdmin);
  const revisar = useServerFn(revisarVerificacao);

  const [items, setItems] = useState<Item[] | null>(null);
  const [filtro, setFiltro] = useState<"pendente" | "aprovado" | "rejeitado" | "todos">("pendente");

  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/auth" }); return; }
    listar().then(setItems).catch((e: any) => toast.error(e.message ?? "Sem acesso"));
  }, [user, loading]);

  async function acao(id: string, acao: "aprovar" | "rejeitar") {
    let motivo: string | undefined;
    if (acao === "rejeitar") {
      const m = prompt("Motivo da recusa (será enviado para a empresa):");
      if (m === null) return;
      motivo = m.trim() || undefined;
    }
    try {
      await revisar({ data: { id, acao, motivo } });
      toast.success(acao === "aprovar" ? "Aprovada ✅" : "Recusada");
      const novo = await listar();
      setItems(novo);
    } catch (e: any) {
      toast.error(e.message ?? "Erro");
    }
  }

  if (!items) return <div className="p-8 text-muted-foreground">Carregando…</div>;

  const filtrados = filtro === "todos" ? items : items.filter((i) => i.status === filtro);

  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b border-border bg-background px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-extrabold">Admin · Verificações de empresas</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <div className="flex gap-2">
          {(["pendente", "aprovado", "rejeitado", "todos"] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${filtro === f ? "bg-foreground text-background" : "bg-card border border-border"}`}>
              {f} {f !== "todos" && `(${items.filter(i => i.status === f).length})`}
            </button>
          ))}
        </div>

        {filtrados.length === 0 && <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Nada por aqui.</p>}

        <div className="space-y-3">
          {filtrados.map((it) => (
            <article key={it.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold">{it.empresa?.company_name ?? "(sem nome)"}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      it.status === "pendente" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      : it.status === "aprovado" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
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
                    <button onClick={() => acao(it.id, "aprovar")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white">
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
      </main>
    </div>
  );
}
