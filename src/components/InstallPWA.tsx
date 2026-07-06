import { useEffect, useState } from "react";
import { Smartphone, Share, Plus, MoreVertical, Download, X, Apple, Monitor } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios" | "android" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows|Macintosh|Linux/i.test(ua)) return "desktop";
  return "unknown";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Bloco de instalação do PWA — mostra instruções por plataforma
 * e usa o beforeinstallprompt no Android/Chrome quando disponível.
 * Se o app já está instalado (standalone), não renderiza nada.
 */
export function InstallPWA() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [installed, setInstalled] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [openHelp, setOpenHelp] = useState<Platform | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const triggerNativeInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    setDeferred(null);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="rounded-3xl border-2 border-border bg-gradient-to-br from-primary/5 via-card to-accent/5 p-6 shadow-soft sm:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
              📱 App VagasAgora
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              Instale o app no seu celular
            </h2>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Rápido, sem ocupar espaço, e você recebe as vagas na hora. Funciona igual
              um aplicativo — mas você instala direto do navegador em 5 segundos.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {deferred && (
                <button
                  onClick={triggerNativeInstall}
                  className="btn-touch shadow-pop inline-flex items-center gap-2 bg-accent px-5 text-accent-foreground"
                >
                  <Download className="h-5 w-5" /> Instalar agora
                </button>
              )}
              <button
                onClick={() => setOpenHelp(platform === "unknown" ? "android" : platform)}
                className="btn-touch inline-flex items-center gap-2 border-2 border-border bg-card px-5 text-foreground hover:bg-secondary"
              >
                <Smartphone className="h-5 w-5" /> Como instalar
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <PlatformChip icon={<Apple className="h-3.5 w-3.5" />} label="iPhone / iPad" onClick={() => setOpenHelp("ios")} active={platform === "ios"} />
              <PlatformChip icon={<Smartphone className="h-3.5 w-3.5" />} label="Android" onClick={() => setOpenHelp("android")} active={platform === "android"} />
              <PlatformChip icon={<Monitor className="h-3.5 w-3.5" />} label="Computador" onClick={() => setOpenHelp("desktop")} active={platform === "desktop"} />
            </div>
          </div>

          <div className="hidden md:block">
            <div className="relative">
              <div className="grid h-40 w-40 place-items-center rounded-[36px] bg-gradient-to-br from-primary to-accent shadow-2xl">
                <span className="font-display text-5xl font-extrabold text-white">VA</span>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-background">
                VagasAgora
              </div>
            </div>
          </div>
        </div>
      </div>

      {openHelp && <HelpModal platform={openHelp} onClose={() => setOpenHelp(null)} />}
    </section>
  );
}

function PlatformChip({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-secondary"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function HelpModal({ platform, onClose }: { platform: Platform; onClose: () => void }) {
  const steps =
    platform === "ios"
      ? [
          { icon: <Share className="h-5 w-5" />, text: "Abra este site no Safari (não funciona em outros navegadores no iPhone)." },
          { icon: <Share className="h-5 w-5" />, text: "Toque no botão Compartilhar (o quadradinho com seta pra cima) na barra de baixo." },
          { icon: <Plus className="h-5 w-5" />, text: 'Role a lista e toque em "Adicionar à Tela de Início".' },
          { icon: <Check />, text: 'Toque em "Adicionar" no canto superior direito. Pronto — o ícone do VagasAgora fica na sua tela.' },
        ]
      : platform === "android"
        ? [
            { icon: <MoreVertical className="h-5 w-5" />, text: "Toque no menu ⋮ (três pontinhos) no canto superior direito do Chrome." },
            { icon: <Download className="h-5 w-5" />, text: 'Escolha "Instalar aplicativo" ou "Adicionar à tela inicial".' },
            { icon: <Check />, text: "Confirme. O ícone do VagasAgora aparece na sua tela como um app normal." },
          ]
        : [
            { icon: <Download className="h-5 w-5" />, text: "Na barra de endereço do Chrome/Edge, clique no ícone de instalar (⤓) do lado direito." },
            { icon: <Plus className="h-5 w-5" />, text: 'Ou vá em Menu → "Instalar VagasAgora…"' },
            { icon: <Check />, text: "O app abre em janela própria e fica no seu menu iniciar / dock." },
          ];

  const titulo =
    platform === "ios" ? "Instalar no iPhone / iPad" : platform === "android" ? "Instalar no Android" : "Instalar no computador";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-extrabold">{titulo}</h3>
          <button onClick={onClose} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl bg-secondary/50 p-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                <span className="text-sm font-extrabold">{i + 1}</span>
              </div>
              <div className="flex-1 text-sm text-foreground">
                <div className="mb-1 inline-flex items-center gap-1.5 text-muted-foreground">{s.icon}</div>
                <div>{s.text}</div>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Não ocupa espaço extra e funciona offline nas telas já visitadas.
        </p>
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
