import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Favoritos } from "@/components/candidato/panels";

export const Route = createFileRoute("/candidato/salvas")({
  head: () => ({ meta: [{ title: "Vagas salvas — VagasAgora" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  if (!user) return null;
  return <Favoritos userId={user.id} />;
}
