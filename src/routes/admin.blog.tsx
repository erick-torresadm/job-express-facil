import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ExternalLink, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/AdminShell";
import { listarPostsAdmin, excluirPostAdmin } from "@/lib/blog-admin.functions";

export const Route = createFileRoute("/admin/blog")({
  head: () => ({ meta: [{ title: "Blog — Admin" }, { name: "robots", content: "noindex" }] }),
  component: BlogAdmin,
});

function BlogAdmin() {
  const fetchList = useServerFn(listarPostsAdmin);
  const remover = useServerFn(excluirPostAdmin);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-posts"], queryFn: () => fetchList() });

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Excluir "${titulo}"?`)) return;
    try {
      await remover({ data: { id } });
      toast.success("Post excluído");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <AdminShell title="Blog">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data?.length ?? 0} post(s)</p>
        <Link to="/admin/blog/novo" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Novo post
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !data?.length ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum post ainda. Crie o primeiro!
        </div>
      ) : (
        <ul className="space-y-2">
          {data.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              {p.cover_url ? (
                <img src={p.cover_url} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-14 w-20 shrink-0 rounded-lg bg-secondary" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-bold">{p.titulo}</h3>
                  {p.publicado ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Publicado</span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">Rascunho</span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">/{p.slug} • {new Date(p.updated_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                {p.publicado && (
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" title="Ver"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-secondary">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <Link to="/admin/blog/$id" params={{ id: p.id }} title="Editar"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-secondary">
                  <Pencil className="h-4 w-4" />
                </Link>
                <button onClick={() => handleDelete(p.id, p.titulo)} title="Excluir"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
