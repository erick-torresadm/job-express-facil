import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, loadMuted, playSound, setMuted } from "@/lib/sounds";

export function SoundProvider() {
  const [, force] = useState(0);

  useEffect(() => {
    loadMuted();
    force((n) => n + 1);

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest(
        'button, a, [role="button"], [data-sound], input[type="checkbox"], input[type="radio"], summary'
      ) as HTMLElement | null;
      if (!el) return;
      if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return;

      const custom = el.getAttribute("data-sound");
      if (custom) {
        playSound(custom as any);
        return;
      }
      // Heurística por tipo
      if (el.tagName === "A") return playSound("swoosh");
      const type = (el as HTMLButtonElement).type;
      if (type === "submit") return playSound("pop");
      playSound("click");
    };

    const onSubmit = () => playSound("success");

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
