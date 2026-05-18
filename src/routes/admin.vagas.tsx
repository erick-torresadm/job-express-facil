import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Power, PowerOff, Trash2, AlertTriangle, MapPin, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { listarVagasAdmin, toggleVagaAtivaAdmin, removerVagaAdmin } from "@/lib/admin.functions";
import { toast } from "sonner";

type Filtro = "todas" | "ativas" | "inativas" | "risco";

export const Route = createFileRoute("/admin/vagas")({
  head: () => ({ meta: [{ title: "Admin · Vagas" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s) => ({ filtro: (s.filtro as Filtro) ?? "todas" }),
  component: AdminVagas,
});

function AdminVagas() {
  const { filtro: initial } = Route.useSearch();
  const [filtro, setFiltro] = useState<Filtro>(initial);
  const [busca, setBusca] = useState("");
  const qc = useQueryClient();
  const fetchVagas = useServerFn(listarVagasAdmin);
  const toggleFn = useServerFn(toggleVagaAtivaAdmin);
  const removerFn = useServerFn(removerVagaAdmin);

  const { data: vagas, isLoading } = useQuery({
    queryKey: ["admin-vagas", filtro, busca],
    queryFn: () => fetchVagas({ data: { filtro, busca: busca.trim() || undefined } }),
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; ativa: boolean }) => toggleFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-vagas"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remover = useMutation({
    mutationFn: (id: string) => removerFn({ data: { id } }),
    onSuccess: () => { toast.success("Vaga removida"); qc.invalidateQueries({ queryKey: ["admin-vagas"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell title="Moderar vagas">
      <div className="flex flex-wrap items-center gap-2">
        {(["todas", "ativas", "inativas", "risco"] as const).map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              filtro === f ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}>
            {f === "risco" ? "⚠️ Risco" : f}
          </button>
        ))}
        <div className="ml-auto flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 sm:w-64">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar título ou empresa..."
            className="h-9 flex-1 bg-transparent text-sm outline-none" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && vagas?.length === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhuma vaga encontrada.
          </p>
        )}
        {vagas?.map((v) => {
          const slug = `${v.profissao_slug}-em-${(v.cidade ?? "").toLowerCase().replace(/\s+/g, "-")}`;
          return (
            <div key={v.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-bold">{v.titulo}</h3>
                  {!v.ativa && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">Inativa</span>}
                  {v.risco_fraude >= 50 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                      <AlertTriangle className="h-3 w-3" /> Risco {v.risco_fraude}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{v.empresa_nome} • <MapPin className="inline h-3 w-3" /> {v.bairro}, {v.cidade}</p>
                <p className="text-xs font-semibold">{v.salario}</p>
                {v.risco_motivo && <p className="mt-1 text-[11px] text-destructive">{v.risco_motivo}</p>}
                <p className="mt-1 text-[10px] uppercase text-muted-foreground">Criada em {new Date(v.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <a href={`/vagas/${slug}`} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-lg border border-border text-foreground" title="Ver pública">
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button onClick={() => toggle.mutate({ id: v.id, ativa: !v.ativa })}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold ${v.ativa ? "bg-warning/15 text-warning" : "bg-accent text-accent-foreground"}`}>
                  {v.ativa ? <><PowerOff className="h-3.5 w-3.5" /> Pausar</> : <><Power className="h-3.5 w-3.5" /> Ativar</>}
                </button>
                <button onClick={() => { if (confirm("Remover essa vaga permanentemente?")) remover.mutate(v.id); }}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border text-destructive" title="Remover">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
