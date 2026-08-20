import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { MailCheck, Inbox, Trash2, ArrowLeft } from "lucide-react";
import { z } from "zod";

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

function ConfirmeSeuEmail() {
  const { email } = useSearch({ from: "/confirme-seu-email" });

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

      <Link to="/auth" className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voltar pra tela de entrar
      </Link>
    </div>
  );
}
