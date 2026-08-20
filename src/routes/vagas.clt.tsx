import { createFileRoute } from "@tanstack/react-router";
import { VagasPublicListing, validateVagasSearch } from "@/components/VagasPublicListing";

const TITLE = "Vagas CLT — Carteira assinada perto de você | VagasAgora";
const DESC = "Vagas CLT com carteira assinada em empresas verificadas. Filtre por cidade, cargo e salário. Candidate-se grátis em 1 clique — sem burocracia.";

export const Route = createFileRoute("/vagas/clt")({
  validateSearch: validateVagasSearch,
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
      basePath="/vagas/clt"
      regime="clt"
      titulo="Vagas CLT — Carteira assinada"
      subtitulo="Só oportunidades formais com carteira assinada, décimo terceiro, férias e benefícios. Empresas verificadas."
    />
  );
}
