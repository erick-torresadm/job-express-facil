import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Eye, MousePointerClick } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/anuncios")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw redirect({ to: "/" });
  },
  component: AdminAnuncios,
});

const PLACEMENTS = [
  { id: "home_meio", label: "Home — meio da página" },
  { id: "home_inferior", label: "Home — antes dos depoimentos" },
  { id: "vagas_lista_topo", label: "Lista de vagas — topo" },
  { id: "blog_topo", label: "Blog — topo da listagem" },
  { id: "blog_post_fim", label: "Post do blog — fim do artigo" },
  { id: "rodape", label: "Rodapé global" },
];

type Anuncio = {
  id: string;
  placement: string;
  titulo: string | null;
  imagem_url: string | null;
  link_url: string | null;
  html_custom: string | null;
  ativo: boolean;
  prioridade: number;
  impressoes: number;
  cliques: number;
};

function AdminAnuncios() {
  const qc = useQueryClient();
  const { data: anuncios } = useQuery({
    queryKey: ["admin-anuncios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .order("placement")
        .order("prioridade", { ascending: false });
      if (error) throw error;
      return data as Anuncio[];
    },
  });

  const [form, setForm] = useState({
    placement: PLACEMENTS[0].id,
    titulo: "",
    imagem_url: "",
    link_url: "",
    html_custom: "",
    prioridade: 0,
    ativo: true,
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("anuncios").insert({
        ...form,
        titulo: form.titulo || null,
        imagem_url: form.imagem_url || null,
        link_url: form.link_url || null,
        html_custom: form.html_custom || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Anúncio criado");
      setForm({ ...form, titulo: "", imagem_url: "", link_url: "", html_custom: "" });
      qc.invalidateQueries({ queryKey: ["admin-anuncios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAtivo = useMutation({
    mutationFn: async (a: Anuncio) => {
      const { error } = await supabase.from("anuncios").update({ ativo: !a.ativo }).eq("id", a.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-anuncios"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("anuncios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removido");
      qc.invalidateQueries({ queryKey: ["admin-anuncios"] });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="mt-3 text-3xl font-black">Anúncios patrocinados</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adicione anúncios próprios ou de parceiros. Para AdSense, configure o cliente em
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5">src/components/AdSlot.tsx</code>.
        </p>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Plus className="h-4 w-4" /> Novo anúncio</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="font-semibold">Posição</span>
              <select
                value={form.placement}
                onChange={(e) => setForm({ ...form, placement: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="font-semibold">Prioridade</span>
              <input type="number" value={form.prioridade}
                onChange={(e) => setForm({ ...form, prioridade: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="font-semibold">Título (opcional)</span>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="font-semibold">Link de destino</span>
              <input type="url" placeholder="https://" value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="font-semibold">URL da imagem</span>
              <input type="url" placeholder="https://..." value={form.imagem_url}
                onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="font-semibold">HTML customizado (opcional — sobrescreve imagem/link)</span>
              <textarea rows={3} value={form.html_custom}
                onChange={(e) => setForm({ ...form, html_custom: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" />
            </label>
          </div>
          <button
            onClick={() => create.mutate()}
            disabled={create.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Criar anúncio
          </button>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-bold">Anúncios cadastrados</h2>
          {anuncios?.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhum anúncio ainda.
            </p>
          )}
          {anuncios?.map((a) => (
            <div key={a.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              {a.imagem_url ? (
                <img src={a.imagem_url} alt="" className="h-14 w-24 rounded-md object-cover" />
              ) : (
                <div className="grid h-14 w-24 place-items-center rounded-md bg-muted text-[10px] text-muted-foreground">HTML</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.titulo || "(sem título)"}</p>
                <p className="text-xs text-muted-foreground">
                  {PLACEMENTS.find((p) => p.id === a.placement)?.label ?? a.placement}
                  {" • "}prioridade {a.prioridade}
                </p>
                <p className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {a.impressoes}</span>
                  <span className="inline-flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> {a.cliques}</span>
                </p>
              </div>
              <button
                onClick={() => toggleAtivo.mutate(a)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${a.ativo ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {a.ativo ? "Ativo" : "Pausado"}
              </button>
              <button
                onClick={() => remove.mutate(a.id)}
                className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
