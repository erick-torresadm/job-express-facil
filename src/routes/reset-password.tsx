import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — VagasAgora" },
      { name: "description", content: "Crie uma nova senha para sua conta VagasAgora." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // Supabase recovery link creates a session automatically on load.
    // Wait for it (either recovery event or existing session).
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 6) return setErr("A senha precisa ter pelo menos 6 caracteres.");
    if (password !== confirm) return setErr("As senhas não coincidem.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setOk(true);
      setTimeout(() => navigate({ to: "/auth" }), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2">
          <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">VagasAgora</span>
        </Link>
        <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <h1 className="text-2xl font-extrabold tracking-tight">Redefinir senha</h1>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">
            Escolha uma nova senha para acessar sua conta.
          </p>

          {!ready && !ok && (
            <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Validando link de recuperação... Se você não veio de um e-mail recente, solicite um novo link em <Link to="/auth" className="font-bold text-primary">Entrar</Link>.
            </p>
          )}

          {ok ? (
            <p className="rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary">
              Senha atualizada! Redirecionando para o login...
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Nova senha</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6}
                    className="h-12 w-full rounded-xl border-2 border-border bg-background pl-10 pr-3 outline-none focus:border-primary" />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Confirmar senha</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6}
                    className="h-12 w-full rounded-xl border-2 border-border bg-background pl-10 pr-3 outline-none focus:border-primary" />
                </div>
              </label>

              {err && <p className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">{err}</p>}

              <button disabled={loading || !ready} type="submit"
                className="btn-touch shadow-pop flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground disabled:opacity-60">
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                Salvar nova senha
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
