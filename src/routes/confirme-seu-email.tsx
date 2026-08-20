import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MailCheck, Inbox, Trash2, ArrowLeft, RotateCw, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/confirme-seu-email")({
  validateSearch: z.object({ email: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Confirme seu e-mail — VagasAgora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmeSeuEmail,
});

const COOLDOWN_SEGUNDOS = 5 * 60;

function ConfirmeSeuEmail() {
  const { email } = useSearch({ from: "/confirme-seu-email" });
  const [restante, setRestante] = useState(COOLDOWN_SEGUNDOS);
  const [reenviando, setReenviando] = useState(false);

  useEffect(() => {
    if (restante <= 0) return;
    const t = setInterval(() => setRestante((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [restante > 0]);

  const reenviar = async () => {
    if (!email) return;
    setReenviando(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      toast.success("Reenviado! Confira sua caixa de entrada (e o spam).");
      setRestante(COOLDOWN_SEGUNDOS);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não deu pra reenviar agora, tenta de novo em alguns minutos.");
    } finally {
      setReenviando(false);
    }
  };

  const minutos = String(Math.floor(restante / 60)).padStart(2, "0");
  const segundos = String(restante % 60).padStart(2, "0");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10">
        <MailCheck className="h-10 w-10 text-primary" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold">Falta pouco! Confirme seu e-mail</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {email ? (
          <>Enviamos um link de confirmação pra <strong className="text-foreground">{email}</strong>. Clique nele pra ativar sua conta.</>
        ) : (
          <>Enviamos um link de confirmação pro seu e-mail. Clique nele pra ativar sua conta.</>
        )}
      </p>

      <div className="mt-6 w-full space-y-3 rounded-2xl border-2 border-border bg-card p-5 text-left">
        <div className="flex items-start gap-3">
          <Inbox className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm">
            <strong>Não achou na caixa de entrada?</strong> Alguns provedores demoram 1-2 minutos pra entregar.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <p className="text-sm">
            <strong>Confira o Spam e o Lixo Eletrônico.</strong> Às vezes o e-mail de confirmação cai lá — marque como "não é spam" pra próxima vez chegar direto.
          </p>
        </div>
      </div>

      {email && (
        <div className="mt-6">
          <button
            onClick={reenviar}
            disabled={restante > 0 || reenviando}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-card px-5 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            {reenviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
            {restante > 0 ? `Reenviar em ${minutos}:${segundos}` : "Reenviar e-mail de confirmação"}
          </button>
        </div>
      )}

      <Link to="/auth" className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar pra tela de entrar
      </Link>
    </div>
  );
}
