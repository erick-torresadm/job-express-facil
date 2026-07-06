import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Eye, MousePointerClick, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/admin/anuncios")({
  head: () => ({ meta: [{ title: "Admin · Anúncios" }, { name: "robots", content: "noindex" }] }),
  component: AdminAnuncios,
});

const PLACEMENTS: { id: string; label: string; size: string; hint: string }[] = [
  { id: "home_meio", label: "Home — meio da página", size: "1200 × 300 px", hint: "Banner largo (proporção 4:1). Peso máx. 300 KB. JPG/PNG/WebP." },
  { id: "home_inferior", label: "Home — antes dos depoimentos", size: "1200 × 300 px", hint: "Banner largo (proporção 4:1). Peso máx. 300 KB." },
  { id: "vagas_lista_topo", label: "Lista de vagas — topo", size: "970 × 250 px", hint: "Billboard desktop. No mobile é redimensionado. Peso máx. 250 KB." },
  { id: "blog_topo", label: "Blog — topo da listagem", size: "728 × 90 px", hint: "Leaderboard clássico. Peso máx. 150 KB." },
  { id: "blog_post_fim", label: "Post do blog — fim do artigo", size: "600 × 500 px", hint: "Bloco quadrado/retangular. Peso máx. 300 KB." },
  { id: "rodape", label: "Rodapé global", size: "1200 × 120 px", hint: "Faixa fina. Peso máx. 150 KB." },
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
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAtivo = useMutation({
    mutationFn: async (a: Anuncio) => {
      const { error } = await supabase.from("anuncios").update({ ativo: !a.ativo }).eq("id", a.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-anuncios"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("anuncios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removido");
      qc.invalidateQueries({ queryKey: ["admin-anuncios"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const [uploading, setUploading] = useState(false);
  const selectedPlacement = PLACEMENTS.find((p) => p.id === form.placement)!;

  const handleUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error("Arquivo maior que 500 KB. Otimize a imagem antes de subir.");
      return;
    }
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG, WebP ou GIF.");
      return;
    }
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Sem sessão");
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${uid}/anuncios/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("social-media").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("social-media").getPublicUrl(path);
      setForm((f) => ({ ...f, imagem_url: pub.publicUrl }));
      toast.success("Imagem enviada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminShell title="Anúncios">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Plus className="h-4 w-4" /> Novo anúncio</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Para AdSense, configure o cliente em <code className="rounded bg-muted px-1.5 py-0.5">src/components/AdSlot.tsx</code>.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="font-semibold">Posição</span>
            <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2">
              {PLACEMENTS.map((p) => <option key={p.id} value={p.id}>{p.label} — {p.size}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold">Prioridade</span>
            <input type="number" value={form.prioridade}
              onChange={(e) => setForm({ ...form, prioridade: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
          </label>
          <div className="md:col-span-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 text-xs">
            <p className="font-bold text-primary">Tamanho recomendado: {selectedPlacement.size}</p>
            <p className="mt-0.5 text-muted-foreground">{selectedPlacement.hint}</p>
          </div>
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
        <button onClick={() => create.mutate()} disabled={create.isPending}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
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
                {PLACEMENTS.find((p) => p.id === a.placement)?.label ?? a.placement} • prioridade {a.prioridade}
              </p>
              <p className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {a.impressoes}</span>
                <span className="inline-flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> {a.cliques}</span>
              </p>
            </div>
            <button onClick={() => toggleAtivo.mutate(a)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${a.ativo ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
              {a.ativo ? "Ativo" : "Pausado"}
            </button>
            <button onClick={() => remove.mutate(a.id)} className="rounded-md p-2 text-destructive hover:bg-destructive/10" aria-label="Remover">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
