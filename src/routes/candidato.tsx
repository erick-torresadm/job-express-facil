import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Loader2, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarCandidato } from "@/components/candidato/AppSidebarCandidato";

export const Route = createFileRoute("/candidato")({
  head: () => ({
    meta: [
      { title: "Minha área — VagasAgora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CandidatoLayout,
});

type Perfil = { full_name: string | null; avatar_url: string | null; handle: string | null };

const CRUMB: Record<string, string> = {
  "/candidato": "Painel",
  "/candidato/vagas": "Vagas pra você",
  "/candidato/candidaturas": "Minhas candidaturas",
  "/candidato/salvas": "Vagas salvas",
  "/candidato/alertas": "Alertas de vaga",
  "/candidato/curriculo": "Meu currículo",
};

function CandidatoLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [counts, setCounts] = useState({ candidaturas: 0, salvas: 0, alertas: 0 });
  const [cvSlug, setCvSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const reload = useCallback(async () => {
    if (!user) return;
    const [{ data: prof }, { data: cv }, { count: cCount }, { count: fCount }, { count: aCount }] = await Promise.all([
      supabase.from("profiles").select("full_name,avatar_url,handle").eq("id", user.id).maybeSingle(),
      supabase.from("curriculos").select("slug").eq("user_id", user.id).limit(1).maybeSingle(),
      supabase.from("candidaturas").select("id", { count: "exact", head: true }).eq("candidato_id", user.id),
      supabase.from("favoritos").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("alertas").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    setPerfil(prof ?? null);
    setCvSlug(cv?.slug ?? null);
    setCounts({ candidaturas: cCount ?? 0, salvas: fCount ?? 0, alertas: aCount ?? 0 });
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return null;

  const nome = perfil?.full_name || user.email?.split("@")[0] || "Candidato";
  const inicial = nome.slice(0, 1).toUpperCase();
  const crumb = CRUMB[path] ?? "Painel";

  return (
    <div className="theme-ocean min-h-screen bg-background text-foreground">
      <SidebarProvider>
        <AppSidebarCandidato
          perfilNome={nome}
          perfilInicial={inicial}
          avatarUrl={perfil?.avatar_url}
          counts={counts}
        />
        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur sm:px-5">
            <SidebarTrigger aria-label="Abrir menu">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Área do candidato
              </p>
              <h1 className="truncate text-sm font-bold leading-tight sm:text-base">{crumb}</h1>
            </div>
            <Link to="/" className="hidden text-xs font-semibold text-muted-foreground hover:text-foreground sm:inline">
              ← Voltar ao site
            </Link>
          </header>

          <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
            <Outlet
              // @ts-expect-error passamos contexto pelos route context abaixo
              context={{ userId: user.id, cvSlug, perfil, reload }}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export type CandidatoCtx = {
  userId: string;
  cvSlug: string | null;
  perfil: Perfil | null;
  reload: () => void;
};
