import { Sparkles, Gift, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

// Promoção de lançamento: janela até 06/01/2027.
// Quem se cadastrar nesse período ganha Pro grátis por 2 anos.
export const PROMO_FIM = new Date("2027-01-06T23:59:59-03:00");

export function isPromoAtiva() {
  return Date.now() <= PROMO_FIM.getTime();
}

const DISMISS_KEY = "va_promo_lanc_dismiss_v2";

export function PromoLancamentoBanner({ compact = false }: { compact?: boolean }) {
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const v = sessionStorage.getItem(DISMISS_KEY);
      setDismissed(v === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!isPromoAtiva()) return null;

  if (compact) {
    if (!mounted || dismissed) return null;
    const close = () => {
      setDismissed(true);
      try {
        sessionStorage.setItem(DISMISS_KEY, "1");
      } catch {}
    };
    return (
      <div className="fixed inset-x-3 bottom-3 z-40 flex justify-center pointer-events-none sm:inset-x-auto sm:right-4 sm:bottom-4 sm:left-auto sm:justify-end">
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-accent/40 bg-gradient-to-r from-primary via-primary to-accent px-4 py-3 text-primary-foreground shadow-pop backdrop-blur-md sm:w-auto">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15">
            <Gift className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1 text-[13px] leading-tight">
            <p className="font-bold">Pro grátis por 2 anos</p>
            <p className="opacity-80">Cadastre-se até 06/01/2027.</p>
          </div>
          <Link
            to="/cadastro"
            className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black text-primary hover:scale-105 transition"
          >
            Quero
          </Link>
          <button
            onClick={close}
            aria-label="Fechar promoção"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-primary-foreground/80 hover:bg-white/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
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
