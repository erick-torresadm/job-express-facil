import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span title="Empresa verificada pelo VagasAgora"
      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
      <BadgeCheck className={cls} /> Verificada
    </span>
  );
}
