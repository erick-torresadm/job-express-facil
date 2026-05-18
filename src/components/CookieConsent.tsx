import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "vagaja_cookie_consent_v1";

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  date: string;
};

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const save = (c: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    } catch {}
    setOpen(false);
  };

  const acceptAll = () =>
    save({ necessary: true, analytics: true, marketing: true, date: new Date().toISOString() });
  const rejectAll = () =>
    save({ necessary: true, analytics: false, marketing: false, date: new Date().toISOString() });
  const saveCustom = () =>
    save({ necessary: true, analytics, marketing, date: new Date().toISOString() });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="fixed inset-x-0 bottom-0 z-[100] px-3 pb-3 sm:px-6 sm:pb-6"
          role="dialog"
          aria-label="Aviso de cookies (LGPD)"
        >
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3 p-4 sm:p-5">
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground sm:text-base">
                  Sua privacidade é importante 🍪
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Usamos cookies para melhorar sua experiência, analisar tráfego e personalizar conteúdo,
                  em conformidade com a{" "}
                  <span className="font-medium text-foreground">LGPD (Lei 13.709/2018)</span>. Você pode
                  aceitar todos, recusar ou escolher suas preferências. Saiba mais em nossa{" "}
                  <Link to="/" className="underline underline-offset-2 hover:text-foreground">
                    Política de Privacidade
                  </Link>
                  .
                </p>

                <AnimatePresence initial={false}>
                  {showPrefs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-2 rounded-xl border border-border/70 bg-muted/30 p-3">
                        <Pref
                          title="Necessários"
                          desc="Essenciais para o funcionamento do site (login, segurança). Sempre ativos."
                          checked
                          disabled
                        />
                        <Pref
                          title="Analíticos"
                          desc="Nos ajudam a entender como você usa o site para melhorá-lo."
                          checked={analytics}
                          onChange={setAnalytics}
                        />
                        <Pref
                          title="Marketing"
                          desc="Usados para mostrar anúncios e conteúdos relevantes."
                          checked={marketing}
                          onChange={setMarketing}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                  {!showPrefs ? (
                    <button
                      onClick={() => setShowPrefs(true)}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground sm:mr-auto"
                    >
                      Personalizar
                    </button>
                  ) : (
                    <button
                      onClick={saveCustom}
                      className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted sm:mr-auto"
                    >
                      Salvar preferências
                    </button>
                  )}
                  <button
                    onClick={rejectAll}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Recusar
                  </button>
                  <button
                    onClick={acceptAll}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
                  >
                    Aceitar todos
                  </button>
                </div>
              </div>
              <button
                onClick={rejectAll}
                aria-label="Fechar"
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Pref({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-background/60">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 accent-primary disabled:opacity-60"
      />
      <div className="flex-1">
        <div className="text-xs font-semibold text-foreground">{title}</div>
        <div className="text-[11px] leading-relaxed text-muted-foreground">{desc}</div>
      </div>
    </label>
  );
}
