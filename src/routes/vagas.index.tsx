import { createFileRoute } from "@tanstack/react-router";
import { VagasPublicListing, validateVagasSearch } from "@/components/VagasPublicListing";

const TITLE = "Vagas de emprego perto de você — VagasAgora";
const DESC = "Todas as vagas de emprego CLT, PJ, estágio e diária. Encontre oportunidades por cidade, cargo e empresa. Cadastre-se grátis e candidate-se em 1 clique.";

export const Route = createFileRoute("/vagas/")({
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
      basePath="/vagas"
      regime="todos"
      titulo="Todas as vagas abertas"
      subtitulo="Explore oportunidades CLT, PJ, estágio e diária de empresas verificadas na sua região. Sem cadastro para pesquisar."
    />
  );
}
