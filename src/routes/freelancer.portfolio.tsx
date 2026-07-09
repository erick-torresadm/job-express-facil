import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit3,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Lightbulb,
  Eye,
  X,
  Star,
  CheckCircle2,
  ChevronRight,
  Palette,
  Camera,
  Video,
  Code2,
} from "lucide-react";
import {
  listMeusProjetos,
  saveMeuProjeto,
  deleteMeuProjeto,
  getMeuFreelancer,
} from "@/lib/freelas.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/freelancer/portfolio")({
  component: PortfolioPage,
});

// ---------- Sugestões por categoria ----------
const IDEIAS_POR_CATEGORIA: Record<string, { titulo: string; descricao: string; tags: string[] }[]> = {
  "design-grafico": [
    { titulo: "Identidade visual para [Cliente]", descricao: "Logo, paleta de cores, tipografia e aplicações. Case completo com o antes/depois e o racional criativo.", tags: ["logo", "branding", "identidade"] },
    { titulo: "Cardápio delivery — [Restaurante]", descricao: "Layout de cardápio digital + impresso. Mostre o produto final e a foto real sendo usado.", tags: ["editorial", "impresso"] },
    { titulo: "Kit de posts para Instagram", descricao: "Grade de 9 posts com identidade coesa. Prove com screenshot do feed.", tags: ["social", "instagram"] },
  ],
  "design-ui-ux": [
    { titulo: "Redesign do app [Nome]", descricao: "Antes / depois de 3–4 telas principais. Cite métrica melhorada (tempo de tarefa, conversão).", tags: ["ux", "mobile", "app"] },
    { titulo: "Landing page que converteu X%", descricao: "Wireframe → hi-fi → resultado. Screenshots reais do Google Analytics ou Hotjar.", tags: ["landing", "conversao"] },
    { titulo: "Design system para SaaS", descricao: "Componentes, tokens, exemplos de uso. Mostre o Figma organizado.", tags: ["design-system", "figma"] },
  ],
  "desenvolvimento-web": [
    { titulo: "E-commerce em Next.js — [Loja]", descricao: "Stack, principais decisões técnicas, tempo de carga (Lighthouse). Link do deploy.", tags: ["nextjs", "ecommerce"] },
    { titulo: "Dashboard SaaS com Supabase + React", descricao: "Autenticação, RLS, gráficos. Print da tela + link para demo pública.", tags: ["react", "supabase", "dashboard"] },
    { titulo: "Site institucional performático", descricao: "SEO técnico, Core Web Vitals verdes, CMS headless. Prints do PageSpeed.", tags: ["seo", "performance"] },
  ],
  "desenvolvimento-mobile": [
    { titulo: "App iOS/Android — [Nome]", descricao: "Feature principal, stack (React Native / Flutter), link da store. Métricas se puder.", tags: ["react-native", "flutter"] },
    { titulo: "MVP validado em 4 semanas", descricao: "Escopo, entregas por semana, aprendizado. Vídeo de 30s do app rodando.", tags: ["mvp", "startup"] },
  ],
  "social-media": [
    { titulo: "Crescimento de +5k seguidores em 3 meses", descricao: "Estratégia, tipo de conteúdo, tom. Print do painel do Instagram.", tags: ["instagram", "crescimento"] },
    { titulo: "Campanha de lançamento @cliente", descricao: "Grade, stories, reels de destaque. Métricas: alcance, salvamentos, vendas.", tags: ["campanha", "lancamento"] },
  ],
  "marketing-digital": [
    { titulo: "Google Ads para [Segmento]", descricao: "ROAS, CPA, período. Antes/depois de otimização de campanha.", tags: ["google-ads", "performance"] },
    { titulo: "Estratégia de SEO — 3x tráfego orgânico", descricao: "Auditoria, plano, execução. Gráfico do Search Console.", tags: ["seo", "conteudo"] },
  ],
  "redacao-copywriting": [
    { titulo: "Copy da landing que vendeu R$X", descricao: "Estrutura da página, headline, provas sociais. Link ou print.", tags: ["copy", "conversao"] },
    { titulo: "E-mail marketing (open rate 42%)", descricao: "Assunto, corpo, CTA. Print da métrica do Mailchimp/Brevo.", tags: ["email", "crm"] },
  ],
  fotografia: [
    { titulo: "Ensaio de produto — [Marca]", descricao: "10–15 fotos do produto em fundo + em contexto de uso.", tags: ["produto", "still"] },
    { titulo: "Casamento — [Casal]", descricao: "Seleção autoral de 20 fotos do dia. Preview em galeria vertical.", tags: ["casamento", "evento"] },
    { titulo: "Retrato corporativo", descricao: "Fotos de perfil profissional para LinkedIn / site.", tags: ["retrato", "corporativo"] },
  ],
  "video-edicao": [
    { titulo: "Reels que fez 500k views", descricao: "Roteiro, corte, som. Link do vídeo publicado.", tags: ["reels", "instagram"] },
    { titulo: "Vídeo institucional 90s", descricao: "Roteiro, captação, edição, color. Vídeo final incorporado.", tags: ["institucional"] },
  ],
  "audio-locucao": [
    { titulo: "Locução comercial para [Marca]", descricao: "Sample em MP3 + peça final publicada.", tags: ["locucao", "comercial"] },
  ],
  traducao: [
    { titulo: "Legendagem de curso online", descricao: "Idiomas, minutos, ferramenta. Print do resultado.", tags: ["legenda", "curso"] },
  ],
  consultoria: [
    { titulo: "Consultoria de processos — [Cliente]", descricao: "Desafio, plano em 4 etapas, resultado mensurável.", tags: ["consultoria"] },
  ],
  "arquitetura-interiores": [
    { titulo: "Projeto residencial 80m² — [Bairro]", descricao: "Planta, renders 3D, fotos do resultado.", tags: ["residencial", "render"] },
  ],
  ilustracao: [
    { titulo: "Personagens para [Marca/Jogo]", descricao: "Sketches, line-art, final colorido.", tags: ["personagem", "ilustracao"] },
  ],
  outros: [
    { titulo: "Meu melhor trabalho recente", descricao: "Descreva o desafio do cliente, o que você fez e qual foi o resultado.", tags: [] },
  ],
};

const DICAS_GERAIS = [
  { icon: Camera, texto: "Coloque uma capa impactante (retangular, boa qualidade). É o que o cliente vê primeiro." },
  { icon: Sparkles, texto: "Descreva o desafio → o que você fez → o resultado. Cliente adora número: %, tempo, valor." },
  { icon: Star, texto: "Nomeie o cliente quando puder. Autoridade vende mais que catálogo genérico." },
  { icon: ImageIcon, texto: "3 a 6 imagens é o ideal. Mais que isso cansa. Menos que isso parece pouco." },
];

function PortfolioPage() {
  const qc = useQueryClient();
  const { data: freela } = useQuery({ queryKey: ["meu-freelancer"], queryFn: () => getMeuFreelancer() });
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

  const sugestoes = useMemo(
    () => IDEIAS_POR_CATEGORIA[freela?.categoria_principal ?? "outros"] ?? IDEIAS_POR_CATEGORIA.outros,
    [freela?.categoria_principal],
  );

  if (!freela) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Palette className="h-6 w-6" />
        </div>
        <h1 className="font-display text-xl font-black">Crie seu perfil antes de montar o portfólio</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          O portfólio pertence ao seu perfil público. Preencha o básico primeiro (2 minutos).
        </p>
        <Link
          to="/freelancer/perfil"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Criar perfil
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HERO explicativo */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 md:p-8">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-black uppercase tracking-wider text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Seu portfólio
            </span>
            <h1 className="mt-3 font-display text-2xl font-black md:text-3xl">
              Mostre seu melhor. Feche mais projetos.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Cliente decide em 30 segundos olhando 2–3 trabalhos seus. Capriche em <strong>3 projetos</strong> antes
              de encher de conteúdo raso. Menos e melhor sempre ganha.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:min-w-[220px]">
            <button
              onClick={() => setEditing({})}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-pop transition hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" /> Novo projeto
            </button>
            <Link
              to="/freelas/p/$handle"
              params={{ handle: freela.handle }}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-bold hover:border-accent"
            >
              <Eye className="h-3.5 w-3.5" /> Ver perfil público
            </Link>
          </div>
        </div>
      </section>

      {/* DICAS RÁPIDAS */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DICAS_GERAIS.map((d, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <d.icon className="h-4 w-4" />
            </div>
            <p className="text-xs leading-relaxed text-foreground/85">{d.texto}</p>
          </div>
        ))}
      </section>

      {/* SUGESTÕES DE PROJETO PARA A CATEGORIA */}
      {projetos.length < 3 && (
        <section className="rounded-3xl border border-border bg-card p-5 md:p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-700">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">Sugestões pra você</p>
              <h2 className="font-display text-lg font-black">Ideias que funcionam nessa área</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sugestoes.map((s, i) => (
              <button
                key={i}
                onClick={() =>
                  setEditing({
                    titulo: s.titulo,
                    descricao: s.descricao,
                    tags: s.tags,
                  })
                }
                className="group flex flex-col items-start gap-2 rounded-2xl border border-dashed border-border bg-background p-4 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-soft"
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
                  Modelo
                </span>
                <h3 className="line-clamp-2 font-display text-sm font-black group-hover:text-accent">
                  {s.titulo}
                </h3>
                <p className="line-clamp-3 text-xs text-muted-foreground">{s.descricao}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-accent">
                  Usar esse modelo <ChevronRight className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* PROJETOS */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Seus trabalhos</p>
            <h2 className="font-display text-xl font-black">
              Portfólio {projetos.length > 0 && `(${projetos.length})`}
            </h2>
          </div>
          {projetos.length > 0 && (
            <button
              onClick={() => setEditing({})}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold hover:border-accent"
            >
              <Plus className="h-3 w-3" /> Adicionar
            </button>
          )}
        </div>

        {projetos.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-black">Nenhum projeto ainda</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Comece por um trabalho que dá orgulho. Não precisa ser perfeito — precisa ser real.
            </p>
            <button
              onClick={() => setEditing({})}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Adicionar primeiro projeto
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projetos.map((p) => (
              <article
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-pop"
              >
                {p.capa_url || p.imagens?.[0] ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    <img
                      src={p.capa_url || p.imagens[0]}
                      alt={p.titulo}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {!p.publicado && (
                      <span className="absolute left-2 top-2 rounded-full bg-yellow-400/95 px-2 py-0.5 text-[10px] font-black uppercase text-yellow-950">
                        Rascunho
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-primary/10 to-accent/10 text-primary/40">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="line-clamp-1 font-display font-black">{p.titulo}</h3>
                  {p.cliente_nome && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.cliente_nome}
                      {p.ano ? ` · ${p.ano}` : ""}
                    </p>
                  )}
                  <p className="mt-2 line-clamp-2 text-xs text-foreground/70">{p.descricao ?? "Sem descrição."}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setEditing(p)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold hover:border-accent"
                    >
                      <Edit3 className="h-3 w-3" /> Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover "${p.titulo}"?`)) del.mutate(p.id);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editing && <ProjetoModal projeto={editing} freelaUserId={freela.user_id} onClose={() => setEditing(null)} />}
    </div>
  );
}

// ---------- MODAL ----------

type ProjetoForm = {
  id?: string;
  titulo: string;
  slug: string;
  descricao: string;
  cliente_nome: string;
  ano: string;
  link_externo: string;
  tags: string;
  capa_url: string;
  imagens: string[];
  publicado: boolean;
};

function ProjetoModal({
  projeto,
  freelaUserId,
  onClose,
}: {
  projeto: any;
  freelaUserId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<ProjetoForm>({
    id: projeto.id,
    titulo: projeto.titulo ?? "",
    slug: projeto.slug ?? "",
    descricao: projeto.descricao ?? "",
    cliente_nome: projeto.cliente_nome ?? "",
    ano: projeto.ano?.toString() ?? "",
    link_externo: projeto.link_externo ?? "",
    tags: (projeto.tags ?? []).join(", "),
    capa_url: projeto.capa_url ?? "",
    imagens: projeto.imagens ?? [],
    publicado: projeto.publicado ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const capaInputRef = useRef<HTMLInputElement>(null);
  const galInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) throw new Error("Imagem maior que 5MB.");
    if (!file.type.startsWith("image/")) throw new Error("Envie apenas imagens.");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${freelaUserId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("freelas-portfolio").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("freelas-portfolio").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCapa = async (files: FileList | null) => {
    if (!files?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadFile(files[0]);
      setForm((f) => ({ ...f, capa_url: url }));
      toast.success("Capa enviada!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGaleria = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 10 - form.imagens.length)) {
        urls.push(await uploadFile(f));
      }
      setForm((f) => ({ ...f, imagens: [...f.imagens, ...urls] }));
      toast.success(`${urls.length} imagem(ns) enviada(s).`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const save = useMutation({
    mutationFn: () =>
      saveMeuProjeto({
        data: {
          id: form.id || undefined,
          titulo: form.titulo,
          slug:
            form.slug ||
            form.titulo
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 60),
          descricao: form.descricao || null,
          cliente_nome: form.cliente_nome || null,
          ano: form.ano ? Number(form.ano) : null,
          link_externo: form.link_externo || null,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          capa_url: form.capa_url || null,
          imagens: form.imagens,
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

  const descCount = form.descricao.length;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="my-8 w-full max-w-3xl space-y-5 rounded-3xl bg-background p-6 shadow-pop animate-scale-in md:p-8"
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-accent">
              {form.id ? "Editar projeto" : "Novo projeto"}
            </p>
            <h2 className="font-display text-2xl font-black">
              {form.id ? "Atualize os detalhes" : "Conte a história do trabalho"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* CAPA UPLOAD */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Capa (o que o cliente vê primeiro) *
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleCapa(e.dataTransfer.files);
            }}
            className="relative overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/30"
          >
            {form.capa_url ? (
              <div className="relative aspect-[16/9]">
                <img src={form.capa_url} alt="Capa" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, capa_url: "" })}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => capaInputRef.current?.click()}
                  className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-foreground shadow"
                >
                  <Upload className="h-3 w-3" /> Trocar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => capaInputRef.current?.click()}
                className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 text-muted-foreground transition hover:bg-secondary/60"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-foreground">Arraste ou clique para enviar</span>
                <span className="text-[11px]">JPG, PNG ou WEBP · até 5MB · ideal 1600×900</span>
              </button>
            )}
            <input
              ref={capaInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCapa(e.target.files)}
            />
          </div>
        </div>

        {/* TÍTULO + DESCRIÇÃO */}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Título *
            </label>
            <input
              required
              minLength={2}
              maxLength={120}
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ex: Identidade visual para Pizzaria Bella"
              className="w-full rounded-xl border border-border bg-background p-3 text-base font-semibold"
            />
          </div>
          <div>
            <div className="mb-1 flex items-end justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Descrição
              </label>
              <span
                className={`text-[10px] font-semibold ${
                  descCount < 80 ? "text-muted-foreground" : "text-emerald-600"
                }`}
              >
                {descCount} caracteres · <span className="opacity-70">80+ recomendado</span>
              </span>
            </div>
            <textarea
              rows={5}
              maxLength={3000}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Desafio → o que você fez → resultado. Ex: 'A pizzaria queria reposicionar a marca para público jovem. Criei nova identidade + cardápio + posts. Em 60 dias o Instagram cresceu 3x.'"
              className="w-full rounded-xl border border-border bg-background p-3 text-sm leading-relaxed"
            />
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-900">
            <strong className="mr-1">Dica:</strong> Comece pelo problema do cliente, depois sua solução, termine
            com o resultado. Cliente compra transformação, não pixel.
          </div>
        </div>

        {/* CLIENTE / ANO / LINK */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <FieldMini label="Cliente" value={form.cliente_nome} onChange={(v) => setForm({ ...form, cliente_nome: v })} />
          <FieldMini label="Ano" type="number" value={form.ano} onChange={(v) => setForm({ ...form, ano: v })} />
          <div className="col-span-2">
            <FieldMini label="Link externo" value={form.link_externo} onChange={(v) => setForm({ ...form, link_externo: v })} placeholder="https://…" />
          </div>
        </div>

        {/* TAGS */}
        <FieldMini
          label="Tags (separadas por vírgula)"
          value={form.tags}
          onChange={(v) => setForm({ ...form, tags: v })}
          placeholder="branding, logo, restaurante"
        />

        {/* GALERIA */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Galeria (até 10 imagens)
            </label>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {form.imagens.length}/10
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {form.imagens.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
                <img src={url} alt={`Imagem ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imagens: form.imagens.filter((_, ix) => ix !== i) })}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {form.imagens.length < 10 && (
              <button
                type="button"
                onClick={() => galInputRef.current?.click()}
                className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
          <input
            ref={galInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleGaleria(e.target.files)}
          />
        </div>

        {/* PUBLICADO */}
        <label className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <input
            type="checkbox"
            checked={form.publicado}
            onChange={(e) => setForm({ ...form, publicado: e.target.checked })}
            className="h-4 w-4"
          />
          <div className="flex-1">
            <p className="text-sm font-bold">Publicar no perfil</p>
            <p className="text-[11px] text-muted-foreground">
              Desmarque para manter como rascunho enquanto trabalha.
            </p>
          </div>
          {form.publicado ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          )}
        </label>

        {/* AÇÕES */}
        <div className="sticky bottom-0 -mx-6 -mb-6 flex gap-2 border-t border-border bg-background/95 p-4 backdrop-blur md:-mx-8 md:-mb-8 md:p-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-bold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={save.isPending || uploading || !form.titulo}
            className="flex-[2] rounded-full bg-primary py-2.5 text-sm font-black text-primary-foreground shadow-soft disabled:opacity-50"
          >
            {uploading ? "Enviando imagem…" : save.isPending ? "Salvando…" : form.id ? "Salvar alterações" : "Publicar projeto"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldMini({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
      />
    </div>
  );
}
