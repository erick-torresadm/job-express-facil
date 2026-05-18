import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, UserPlus, UserCheck, Loader2, Building2, Linkedin, Mail } from "lucide-react";
import { getPerfilByHandle, toggleFollow, type PerfilSocial } from "@/lib/social.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/u/$handle")({
  loader: async ({ params }) => {
    const handle = params.handle.replace(/^@/, "");
    const perfil = await getPerfilByHandle({ data: { handle, viewerId: null } });
    if (!perfil) throw notFound();
    return perfil as PerfilSocial;
  },
  head: ({ loaderData }) => {
    const p = loaderData;
    const nome = p?.full_name ?? p?.company_name ?? `@${p?.handle}`;
    const title = p ? `${nome} (@${p.handle}) — VagasAgora` : "Perfil";
    const desc = p?.bio_social ?? `Perfil de ${nome} na VagasAgora.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        ...(p?.avatar_url ? [{ property: "og:image", content: p.avatar_url }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-extrabold">Perfil não encontrado</h1>
      <p className="mt-2 text-muted-foreground">Esse @handle não existe ou foi removido.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
        Início
      </Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-bold">Erro ao carregar perfil</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-4 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
          Tentar de novo
        </button>
      </div>
    );
  },
  component: PerfilPublicoPage,
});

function PerfilPublicoPage() {
  const initial = Route.useLoaderData() as PerfilSocial;
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilSocial>(initial);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => { setPerfil(initial); }, [initial]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const uid = data.user?.id ?? null;
      setViewerId(uid);
      // refetch com viewerId para saber se já segue
      if (uid && initial.handle) {
        const updated = await getPerfilByHandle({ data: { handle: initial.handle, viewerId: uid } });
        if (mounted && updated) setPerfil(updated);
      }
    })();
    return () => { mounted = false; };
  }, [initial.handle]);

  const seguir = async () => {
    if (!viewerId) {
      router.navigate({ to: "/auth" });
      return;
    }
    setLoadingFollow(true);
    try {
      const res = await toggleFollow({ data: { targetId: perfil.id } });
      setPerfil((p) => ({
        ...p,
        is_following: res.following,
        followers_count: p.followers_count + (res.following ? 1 : -1),
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFollow(false);
    }
  };

  const nome = perfil.full_name ?? perfil.company_name ?? `@${perfil.handle}`;
  const inicial = nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-2xl">
        {/* Capa */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary to-primary/60 md:h-64 md:rounded-b-3xl">
          {perfil.cover_url && (
            <img src={perfil.cover_url} alt="" className="h-full w-full object-cover" />
          )}
          <Link to="/" className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1.5 text-xs font-bold backdrop-blur hover:bg-background">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>

        {/* Header do perfil */}
        <div className="relative -mt-16 px-4 md:px-6">
          <div className="flex items-end justify-between">
            <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-full border-4 border-background bg-secondary text-4xl font-extrabold text-secondary-foreground shadow-pop">
              {perfil.avatar_url ? (
                <img src={perfil.avatar_url} alt={nome} className="h-full w-full object-cover" />
              ) : (
                <span>{inicial}</span>
              )}
            </div>
            <div className="mb-2 flex gap-2">
              {perfil.is_me ? (
                <Link to="/perfil" className="rounded-full border-2 border-border bg-card px-5 py-2 text-sm font-bold hover:bg-muted">
                  Editar perfil
                </Link>
              ) : (
                <button
                  onClick={seguir}
                  disabled={loadingFollow}
                  className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold shadow-pop disabled:opacity-60 ${
                    perfil.is_following
                      ? "border-2 border-border bg-card hover:bg-muted"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {loadingFollow ? <Loader2 className="h-4 w-4 animate-spin" /> :
                    perfil.is_following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {perfil.is_following ? "Seguindo" : "Seguir"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-extrabold">{nome}</h1>
            <p className="text-sm text-muted-foreground">@{perfil.handle}</p>
            {perfil.role === "empresa" && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                <Building2 className="h-3 w-3" /> Empresa
              </span>
            )}
            {perfil.bio_social && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{perfil.bio_social}</p>
            )}
            <div className="mt-4 flex gap-5 text-sm">
              <div><span className="font-extrabold">{perfil.following_count}</span> <span className="text-muted-foreground">seguindo</span></div>
              <div><span className="font-extrabold">{perfil.followers_count}</span> <span className="text-muted-foreground">seguidores</span></div>
            </div>
          </div>

          {/* Posts placeholder (Fase 2) */}
          <div className="mt-8 rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground">
              📝 As postagens aparecem aqui em breve.
            </p>
          </div>

          <div className="h-16" />
        </div>
      </div>
    </div>
  );
}
