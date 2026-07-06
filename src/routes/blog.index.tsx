import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog VagasAgora — Dicas de emprego, currículo e carreira" },
      { name: "description", content: "Guias práticos para conseguir emprego rápido: currículo em vídeo, vagas perto de você, direitos trabalhistas e mais. Atualizado toda semana." },
      { property: "og:title", content: "Blog VagasAgora" },
      { property: "og:description", content: "Dicas de emprego, currículo e carreira para quem quer começar a trabalhar agora." },
      { property: "og:url", content: "https://job-express-facil.lovable.app/blog" },
    ],
    links: [{ rel: "canonical", href: "https://job-express-facil.lovable.app/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("slug,titulo,resumo,autor,published_at,tags,cover_url")
        .eq("publicado", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <header className="mt-4 mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Blog</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Dicas para arrumar emprego rápido</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Guias práticos, sem enrolação, para você conseguir trabalho perto de casa, com salário justo e carteira assinada.
          </p>
        </header>

        

        {isLoading && <p className="text-muted-foreground">Carregando posts…</p>}


        <div className="grid gap-4 md:grid-cols-2">
          {posts?.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-pop"
            >
              {p.cover_url && (
                <img src={p.cover_url} alt="" loading="lazy" className="mb-4 aspect-[16/9] w-full rounded-xl object-cover" />
              )}
              <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />
                  {new Date(p.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> 4 min</span>
              </div>
              <h2 className="text-xl font-extrabold leading-snug group-hover:text-primary">{p.titulo}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.resumo}</p>
              {Array.isArray(p.tags) && p.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(p.tags as string[]).slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">#{t}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>

        {posts && posts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            Em breve, novos posts.
          </p>
        )}
      </main>
      
    </div>
  );
}
