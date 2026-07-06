import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Alertas } from "@/components/candidato/panels";

export const Route = createFileRoute("/candidato/alertas")({
  head: () => ({ meta: [{ title: "Alertas de vaga — VagasAgora" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  if (!user) return null;
  return <Alertas userId={user.id} />;
}
