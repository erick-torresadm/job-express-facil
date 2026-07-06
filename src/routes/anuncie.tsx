import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect server-side para o WhatsApp comercial. O número NÃO aparece no HTML
// da página — só quem clica em "Anuncie aqui" é enviado para o wa.me.
const WHATSAPP_NUMBER = "5511948333534";
const MESSAGE = "Olá! Quero anunciar no VagasAgora.";

export const Route = createFileRoute("/anuncie")({
  beforeLoad: () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`;
    throw redirect({ href: url });
  },
  component: () => null,
});
