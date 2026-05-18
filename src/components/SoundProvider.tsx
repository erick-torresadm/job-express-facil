import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, loadMuted, playSound, setMuted } from "@/lib/sounds";

export function SoundProvider() {
  const [, force] = useState(0);

  useEffect(() => {
    loadMuted();
    force((n) => n + 1);

    // Toca som APENAS em elementos com data-sound explícito.
    // Assim só ações importantes (salvar, seguir, curtir, candidatar, etc) soam.
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest("[data-sound]") as HTMLElement | null;
      if (!el) return;
      if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return;
      const kind = el.getAttribute("data-sound");
      if (!kind || kind === "none") return;
      playSound(kind as any);
    };

    // Submit de formulário = ação relevante, mantém o "success"
    const onSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement | null;
      if (form?.dataset.sound === "none") return;
      playSound("success");
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  const toggle = () => {
    setMuted(!isMuted());
    if (!isMuted()) playSound("pop");
    force((n) => n + 1);
  };

  const m = isMuted();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={m ? "Ativar sons" : "Desativar sons"}
      title={m ? "Ativar sons" : "Desativar sons"}
      data-sound="none"
      className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur transition hover:scale-110 hover:bg-accent"
    >
      {m ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}
