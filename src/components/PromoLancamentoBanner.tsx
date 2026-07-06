import { Sparkles, Gift } from "lucide-react";
import { Link } from "@tanstack/react-router";

// Promoção de lançamento: 6 meses de janela (até 06/01/2027).
// Quem se cadastrar nesse período ganha Pro grátis por 2 anos.
export const PROMO_FIM = new Date("2027-01-06T23:59:59-03:00");

export function isPromoAtiva() {
  return Date.now() <= PROMO_FIM.getTime();
}

export function PromoLancamentoBanner({ compact = false }: { compact?: boolean }) {
  if (!isPromoAtiva()) return null;

  if (compact) {
    return (
      <div className="w-full bg-gradient-to-r from-accent via-primary to-accent text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-xs font-bold sm:text-sm">
          <Gift className="h-4 w-4 shrink-0" />
          <span>
            <strong>Promoção de lançamento:</strong> cadastre-se agora e ganhe <strong>Pro grátis por 2 anos</strong>. Termina em 06/01/2027.
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-accent/40 bg-gradient-to-br from-accent/15 via-primary/10 to-accent/15 p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Promoção de lançamento
          </span>
          <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Pro grátis por <span className="text-accent">2 anos inteiros</span>
          </h3>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Empresas e candidatos que se cadastrarem até <strong className="text-foreground">06/01/2027</strong> recebem acesso completo — todos os recursos Pro, sem pagar nada, por 24 meses. Nossa forma de agradecer quem confia na VagasAgora desde o início.
          </p>
        </div>
        <Link
          to="/cadastro"
          className="shrink-0 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-pop transition hover:scale-[1.02] active:scale-[0.98]"
        >
          Garantir meu Pro grátis
        </Link>
      </div>
    </section>
  );
}
