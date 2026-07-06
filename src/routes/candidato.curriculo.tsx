import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Curriculo, Loader } from "@/components/candidato/panels";

export const Route = createFileRoute("/candidato/curriculo")({
  head: () => ({ meta: [{ title: "Meu currículo — VagasAgora" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const [slug, setSlug] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    supabase.from("curriculos").select("slug").eq("user_id", user.id).limit(1).maybeSingle()
      .then(({ data }) => setSlug((data?.slug as string | null) ?? null));
  }, [user]);

  if (!user || slug === undefined) return <Loader />;
  return <Curriculo cvSlug={slug} />;
}
