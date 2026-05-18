import { MapPin, Clock, Bus, UtensilsCrossed, Sparkles, AlertTriangle } from "lucide-react";

type RotaProps = {
  km: number;
  minutosTransporte: number;
  custoTransporteMes: number;
  custoAlimentacaoMes?: number | null;
};

export function DistanciaCustoCard({ km, minutosTransporte, custoTransporteMes, custoAlimentacaoMes }: RotaProps) {
  const totalMes = custoTransporteMes + (custoAlimentacaoMes ?? 0);
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
        <MapPin className="h-3.5 w-3.5" /> Custo pra trabalhar aqui
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5"><Bus className="h-4 w-4 text-muted-foreground" /> {km} km</div>
        <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-muted-foreground" /> {minutosTransporte} min</div>
        <div className="flex items-center gap-1.5">🚌 R$ {custoTransporteMes}/mês</div>
        {custoAlimentacaoMes != null && (
          <div className="flex items-center gap-1.5"><UtensilsCrossed className="h-4 w-4 text-muted-foreground" /> R$ {custoAlimentacaoMes}/mês</div>
        )}
      </div>
      {totalMes > 0 && (
        <p className="mt-2 border-t border-primary/20 pt-2 text-xs text-muted-foreground">
          Estimativa total mensal: <strong className="text-foreground">R$ {totalMes}</strong>
        </p>
      )}
    </div>
  );
}

export function MatchScoreBadge({ score, fatores }: { score: number; fatores: string[] }) {
  const cor = score >= 75 ? "bg-success/15 text-success border-success/30" :
              score >= 50 ? "bg-accent/15 text-accent border-accent/40" :
                            "bg-muted text-muted-foreground border-border";
  return (
    <div className={`rounded-xl border px-3 py-2 ${cor}`}>
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        <span className="text-xs font-bold uppercase tracking-wide">Match {score}%</span>
      </div>
      {fatores.length > 0 && (
        <p className="mt-0.5 text-[11px] opacity-80">{fatores.slice(0, 2).join(" · ")}</p>
      )}
    </div>
  );
}

export function FraudBadge({ risco }: { risco: number }) {
  if (risco < 40) return null;
  const claro = risco >= 70;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold uppercase ${
      claro ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"
    }`}>
      <AlertTriangle className="h-3 w-3" /> {claro ? "Suspeita" : "Verificar"}
    </span>
  );
}
