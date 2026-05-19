import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdSlot } from "@/components/AdSlot";

async function fetchPost(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();
  return data;
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => ({ post: await fetchPost(params.slug) }),
  head: ({ loaderData, params }) => {
    const url = `https://vagasagora.com.br/blog/${params.slug}`;
    const title = loaderData?.post ? `${loaderData.post.titulo} — VagasAgora` : "Post";
    const desc = loaderData?.post?.resumo ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        ...(loaderData?.post?.cover_url ? [{ property: "og:image", content: loaderData.post.cover_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: loaderData?.post
        ? [{
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: loaderData.post.titulo,
              description: loaderData.post.resumo,
              author: { "@type": "Organization", name: loaderData.post.autor },
              datePublished: loaderData.post.published_at,
              image: loaderData.post.cover_url ?? undefined,
              mainEntityOfPage: url,
            }),
          }]
        : [],
    };
  },
  component: PostPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Post não encontrado</h1>
        <Link to="/blog" className="mt-4 inline-block text-primary underline">Ver todos os posts</Link>
      </div>
      <SiteFooter />
    </div>
  ),
});

function renderMarkdown(md: string) {
  // Mini renderer: ## H2, **bold**, - lists, 1. ordered, paragraphs
  const blocks = md.split(/\n{2,}/);
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return <h2 key={i} className="mt-8 text-2xl font-extrabold">{block.replace(/^## /, "")}</h2>;
    }
    if (/^\d+\.\s/.test(block)) {
      const items = block.split(/\n/).map((l) => l.replace(/^\d+\.\s/, ""));
      return (
        <ol key={i} className="my-4 list-decimal space-y-2 pl-6 text-foreground/90">
          {items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inline(it) }} />)}
        </ol>
      );
    }
    if (block.startsWith("- ")) {
      const items = block.split(/\n/).map((l) => l.replace(/^- /, ""));
      return (
        <ul key={i} className="my-4 list-disc space-y-2 pl-6 text-foreground/90">
          {items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inline(it) }} />)}
        </ul>
      );
    }
    return <p key={i} className="my-4 leading-relaxed text-foreground/90" dangerouslySetInnerHTML={{ __html: inline(block) }} />;
  });
}

function inline(s: string) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function PostPage() {
  const { post } = Route.useLoaderData();

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ title: post.titulo, text: post.resumo, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Todos os posts
        </Link>

        <article className="mt-6">
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {(post.tags as string[]).map((t) => (
                <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">#{t}</span>
              ))}
            </div>
          )}
          <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">{post.titulo}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.resumo}</p>

          <div className="mt-6 flex items-center justify-between border-b border-border pb-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{post.autor}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />
                {new Date(post.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            </div>
            <button onClick={handleShare} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary">
              <Share2 className="h-3.5 w-3.5" /> Compartilhar
            </button>
          </div>

          {post.cover_url && (
            <img src={post.cover_url} alt={post.titulo} className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover" />
          )}

          <div className="prose-vagas mt-6">{renderMarkdown(post.conteudo)}</div>

          <AdSlot placement="blog_post_fim" format="banner" className="mt-10" />



          <div className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-6 text-center">
            <h3 className="text-2xl font-extrabold">Pronto pra começar?</h3>
            <p className="mt-2 text-muted-foreground">Cadastre-se grátis e receba vagas perto de você no WhatsApp.</p>
            <Link to="/cadastro" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-pop">
              Criar meu currículo grátis
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
