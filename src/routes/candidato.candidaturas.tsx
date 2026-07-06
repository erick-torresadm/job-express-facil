import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Candidaturas } from "@/components/candidato/panels";

export const Route = createFileRoute("/candidato/candidaturas")({
  head: () => ({ meta: [{ title: "Minhas candidaturas — VagasAgora" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  if (!user) return null;
  return <Candidaturas userId={user.id} />;
}
