import { createFileRoute } from "@tanstack/react-router";
import { VagasPublicListing } from "@/components/VagasPublicListing";

const TITLE = "Vagas PJ, MEI e Autônomo — Trabalhe como micro empresa | VagasAgora";
const DESC = "Oportunidades PJ, MEI e autônomas para prestadores de serviço e microempresas. Ganhe mais mantendo sua liberdade — contratos flexíveis e diretos.";

export const Route = createFileRoute("/vagas/pj")({
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
      regime="pj"
      titulo="Vagas PJ / MEI / Autônomo"
      subtitulo="Espaço exclusivo pra microempresas, MEIs e profissionais autônomos. Contratos por projeto, mensalidade fixa ou diária — sem se misturar com vagas CLT."
    />
  );
}
