import { useEffect } from "react";

// Registra o service worker pra TODO visitante (não só quem ativa push) e
// garante update silencioso: quando o navegador baixa uma versão nova do
// SW (novo deploy), ele assume o controle sozinho (push-sw.js já usa
// skipWaiting + clients.claim) e aqui recarregamos a página uma única vez
// pra pegar o HTML/JS mais recente — sem exigir reinstalar o atalho, em
// Android e em iOS 16.4+ (que suporta service worker em PWA "adicionado
// à tela de início").
export function PwaUpdater() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let recarregou = false;
    const onControllerChange = () => {
      if (recarregou) return;
      recarregou = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    let registration: ServiceWorkerRegistration | null = null;
    navigator.serviceWorker.register("/push-sw.js", { scope: "/" }).then((reg) => {
      registration = reg;
    }).catch(() => {});

    // Revisita por versão nova sempre que o app volta ao primeiro plano —
    // é o gatilho mais confiável pra quem abre o PWA pelo ícone depois de dias.
    const checarAtualizacao = () => {
      if (document.visibilityState === "visible") registration?.update().catch(() => {});
    };
    document.addEventListener("visibilitychange", checarAtualizacao);
    window.addEventListener("focus", checarAtualizacao);
    const intervalo = setInterval(checarAtualizacao, 30 * 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", checarAtualizacao);
      window.removeEventListener("focus", checarAtualizacao);
      clearInterval(intervalo);
    };
  }, []);

  return null;
}
