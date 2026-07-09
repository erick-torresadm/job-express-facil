import { MessageCircle } from "lucide-react";

const NUMERO = "5511948333534";
const MENSAGEM = "Olá! Vim do site VagasAgora e quero saber mais sobre os planos para empresas.";

export function WhatsAppFloat() {
  const href = `https://wa.me/${NUMERO}?text=${encodeURIComponent(MENSAGEM)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com atendimento no WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-pop transition hover:scale-110 hover:brightness-110 sm:bottom-24 sm:right-6"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" strokeWidth={0} />
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
    </a>
  );
}
