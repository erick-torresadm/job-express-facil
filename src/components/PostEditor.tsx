import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles, Save } from "lucide-react";
import { toast } from "sonner";
import { getPostAdmin, salvarPostAdmin, sugerirResumoIA } from "@/lib/blog-admin.functions";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

export function PostEditor({ postId }: { postId?: string }) {
  const fetchPost = useServerFn(getPostAdmin);
  const salvar = useServerFn(salvarPostAdmin);
  const sugerir = useServerFn(sugerirResumoIA);
  const nav = useNavigate();

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-post", postId], enabled: !!postId,
    queryFn: () => fetchPost({ data: { id: postId! } }),
  });

  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [autor, setAutor] = useState("Equipe VagasAgora");
  const [coverUrl, setCoverUrl] = useState("");
  const [tags, setTags] = useState("");
  const [publicado, setPublicado] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setTitulo(existing.titulo); setSlug(existing.slug); setSlugTouched(true);
    setResumo(existing.resumo); setConteudo(existing.conteudo);
    setAutor(existing.autor); setCoverUrl(existing.cover_url ?? "");
    setTags((existing.tags as string[] ?? []).join(", "));
    setPublicado(existing.publicado);
  }, [existing]);

  useEffect(() => { if (!slugTouched) setSlug(slugify(titulo)); }, [titulo, slugTouched]);

  const handleSugerir = async () => {
    if (!titulo || conteudo.length < 20) { toast.error("Preencha título e conteúdo antes"); return; }
    setAiLoading(true);
    try {
      const r = await sugerir({ data: { titulo, conteudo } });
      setResumo(r.resumo);
      toast.success("Resumo sugerido");
    } catch (e: any) { toast.error(e.message); } finally { setAiLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const r = await salvar({ data: {
        id: postId, titulo, slug: slug || undefined, resumo, conteudo, autor,
        cover_url: coverUrl || null, tags: tagArr, publicado,
      }});
      toast.success(postId ? "Post atualizado" : "Post criado");
      if (!postId) nav({ to: "/admin/blog/$id", params: { id: r.id } });
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (postId && isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const input = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none";

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Título</label>
        <input className={input} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Como conseguir emprego rápido em 2025" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Slug</label>
          <input className={input} value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} placeholder="como-conseguir-emprego-rapido" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Autor</label>
          <input className={input} value={autor} onChange={(e) => setAutor(e.target.value)} />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-bold uppercase text-muted-foreground">Resumo</label>
          <button type="button" onClick={handleSugerir} disabled={aiLoading}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-secondary disabled:opacity-50">
            {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Sugerir com IA
          </button>
        </div>
        <textarea className={`${input} min-h-[80px]`} value={resumo} onChange={(e) => setResumo(e.target.value)} maxLength={500} />
        <p className="mt-1 text-[10px] text-muted-foreground">{resumo.length}/500</p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Conteúdo (Markdown)</label>
        <textarea className={`${input} min-h-[400px] font-mono text-xs`} value={conteudo} onChange={(e) => setConteudo(e.target.value)}
          placeholder={"# Subtítulo\n\nParágrafo introdutório...\n\n- item 1\n- item 2"} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">URL da capa</label>
          <input className={input} value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
          {coverUrl && <img src={coverUrl} alt="" className="mt-2 aspect-[16/9] w-full rounded-lg object-cover" />}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Tags (separadas por vírgula)</label>
          <input className={input} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="currículo, emprego, dicas" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} className="h-4 w-4" />
          Publicado
        </label>
      </div>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <button onClick={handleSave} disabled={saving || !titulo || !resumo || !conteudo}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
        </button>
      </div>
    </div>
  );
}
