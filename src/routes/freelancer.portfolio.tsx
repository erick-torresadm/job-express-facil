import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { listMeusProjetos, saveMeuProjeto, deleteMeuProjeto } from "@/lib/freelas.functions";

export const Route = createFileRoute("/freelancer/portfolio")({
  component: PortfolioPage,
});

function PortfolioPage() {
  const qc = useQueryClient();
  const { data: projetos = [] } = useQuery({ queryKey: ["meus-projetos"], queryFn: () => listMeusProjetos() });
  const [editing, setEditing] = useState<any | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => deleteMeuProjeto({ data: { id } }),
    onSuccess: () => {
      toast.success("Projeto removido.");
      qc.invalidateQueries({ queryKey: ["meus-projetos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Portfólio</h1>
        <button
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Novo projeto
        </button>
      </div>

      {projetos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Ainda sem projetos. Adicione seu primeiro trabalho para atrair clientes.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projetos.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              {(p.capa_url || p.imagens?.[0]) && (
                <img src={p.capa_url || p.imagens[0]} alt={p.titulo} className="h-40 w-full object-cover" loading="lazy" />
              )}
              <div className="p-4">
                <h3 className="font-bold">{p.titulo}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{p.descricao}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setEditing(p)} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs">
                    <Edit3 className="h-3 w-3" /> Editar
                  </button>
                  <button onClick={() => confirm(`Remover "${p.titulo}"?`) && del.mutate(p.id)} className="inline-flex items-center gap-1 rounded-full border border-destructive/50 px-3 py-1 text-xs text-destructive">
                    <Trash2 className="h-3 w-3" /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <ProjetoModal projeto={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ProjetoModal({ projeto, onClose }: { projeto: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    id: projeto.id,
    titulo: projeto.titulo ?? "",
    slug: projeto.slug ?? "",
    descricao: projeto.descricao ?? "",
    cliente_nome: projeto.cliente_nome ?? "",
    ano: projeto.ano?.toString() ?? "",
    link_externo: projeto.link_externo ?? "",
    tags: (projeto.tags ?? []).join(", "),
    capa_url: projeto.capa_url ?? "",
    imagens: (projeto.imagens ?? []).join("\n"),
    publicado: projeto.publicado ?? true,
  });

  const save = useMutation({
    mutationFn: () =>
      saveMeuProjeto({
        data: {
          id: form.id || undefined,
          titulo: form.titulo,
          slug: form.slug || form.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60),
          descricao: form.descricao || null,
          cliente_nome: form.cliente_nome || null,
          ano: form.ano ? Number(form.ano) : null,
          link_externo: form.link_externo || null,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          capa_url: form.capa_url || null,
          imagens: form.imagens.split("\n").map((u) => u.trim()).filter(Boolean),
          publicado: form.publicado,
        },
      }),
    onSuccess: () => {
      toast.success("Projeto salvo!");
      qc.invalidateQueries({ queryKey: ["meus-projetos"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="max-h-[90vh] w-full max-w-2xl space-y-3 overflow-y-auto rounded-3xl bg-background p-6 shadow-pop"
      >
        <h2 className="font-display text-xl font-bold">{form.id ? "Editar projeto" : "Novo projeto"}</h2>
        <Input label="Título *" value={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} required />
        <Input label="Slug (opcional, gerado auto)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">Descrição</label>
          <textarea rows={4} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Cliente" value={form.cliente_nome} onChange={(v) => setForm({ ...form, cliente_nome: v })} />
          <Input label="Ano" type="number" value={form.ano} onChange={(v) => setForm({ ...form, ano: v })} />
        </div>
        <Input label="Link externo" value={form.link_externo} onChange={(v) => setForm({ ...form, link_externo: v })} placeholder="https://…" />
        <Input label="Tags (vírgula)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
        <Input label="URL da capa" value={form.capa_url} onChange={(v) => setForm({ ...form, capa_url: v })} placeholder="https://…" />
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">URLs das imagens (uma por linha)</label>
          <textarea rows={3} value={form.imagens} onChange={(e) => setForm({ ...form, imagens: e.target.value })} placeholder="https://…" className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.publicado} onChange={(e) => setForm({ ...form, publicado: e.target.checked })} />
          Publicado
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border py-2 text-sm font-semibold">Cancelar</button>
          <button type="submit" disabled={save.isPending} className="flex-1 rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {save.isPending ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder }: any) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
    </div>
  );
}
