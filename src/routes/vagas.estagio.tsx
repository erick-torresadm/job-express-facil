import { createFileRoute } from "@tanstack/react-router";
import { VagasPublicListing } from "@/components/VagasPublicListing";

const TITLE = "Vagas de Estágio — Universitário e Trainee | VagasAgora";
const DESC = "Vagas de estágio para universitários e programas de trainee. Bolsa auxílio, vale-transporte e experiência real em empresas verificadas.";

export const Route = createFileRoute("/vagas/estagio")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <VagasPublicListing
      regime="estagio"
      titulo="Vagas de Estágio"
      subtitulo="Comece sua carreira num estágio de verdade. Programas para universitários e recém-formados, com bolsa auxílio e benefícios."
    />
  );
}
