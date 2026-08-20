import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Building2, HardHat, Mail, Lock, User as UserIcon, Phone, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/hooks/use-auth";
import { notifyNewSignup } from "@/lib/notify.functions";
import { loginComRateLimit, checarRateLimitCadastro } from "@/lib/auth.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — VagasAgora" },
      { name: "description", content: "Crie sua conta de candidato ou empresa na VagasAgora em segundos." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, role: currentRole, loading: authLoading } = useAuth();
  const login = useServerFn(loginComRateLimit);
  const checarLimiteCadastro = useServerFn(checarRateLimitCadastro);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("candidato");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleReset = async () => {
    setErr(null);
    setInfo(null);
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setErr("Digite seu e-mail no campo acima para receber o link de recuperação.");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setInfo("Se este e-mail estiver cadastrado, enviamos um link para redefinir sua senha. Verifique sua caixa de entrada e o spam.");
    } catch {
      setInfo("Se este e-mail estiver cadastrado, enviamos um link para redefinir sua senha. Verifique sua caixa de entrada e o spam.");
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && currentRole) {
      const dest =
        currentRole === "admin" ? "/admin" : currentRole === "empresa" ? "/empresa" : "/cadastro";
      navigate({ to: dest });
    }
  }, [user, currentRole, authLoading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await checarLimiteCadastro();
        if (role === "empresa") {
          const digits = cpfCnpj.replace(/\D/g, "");
          if (digits.length !== 11 && digits.length !== 14) {
            throw new Error("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
          }
          if (whatsapp.replace(/\D/g, "").length < 10) {
            throw new Error("Informe um WhatsApp válido com DDD.");
          }
        }
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              role,
              full_name: fullName,
              whatsapp,
              company_name: role === "empresa" ? companyName : null,
              cpf_cnpj: role === "empresa" ? cpfCnpj.replace(/\D/g, "") : null,
            },
          },
        });
        if (error) throw error;
        // Supabase não retorna erro pra e-mail já cadastrado (evita vazar
        // quem tem conta) — o sinal documentado é identities vazio no user
        // retornado. Sem essa checagem o usuário achava que criou conta nova
        // e ficava esperando um e-mail que nunca chegaria.
        if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
          throw new Error("JÁ_CADASTRADO");
        }
        // Fire-and-forget: notifica admin do novo cadastro
        notifyNewSignup({
          data: {
            tipo: role === "empresa" ? "empresa" : "candidato",
            nome: fullName || (role === "empresa" ? companyName : email),
            email,
            whatsapp: whatsapp || null,
            empresa: role === "empresa" ? companyName || null : null,
          },
        }).catch(() => null);
        // Confirmação de e-mail está ativada no projeto — signUp() não cria
        // sessão até o link ser clicado. Sem isso a tela ficava parada sem
        // nenhum feedback, parecendo travada.
        if (!signUpData.session) {
          navigate({ to: "/confirme-seu-email", search: { email } });
          return;
        }
      } else {
        // Login passa pelo servidor (rate limit por IP + conta) em vez de
        // chamar o Supabase direto do client.
        const { access_token, refresh_token } = await login({ data: { email, password } });
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) throw error;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "JÁ_CADASTRADO") {
        setErr("Esse e-mail já tem conta no VagasAgora. Use a opção \"Entrar\" ou clique em \"Esqueci minha senha\" se não lembrar.");
      } else if (msg.includes("Muitas requisições")) {
        setErr(msg);
      } else if (mode === "signup") {
        setErr("Não foi possível concluir o cadastro. Verifique os dados e tente novamente.");
      } else {
        setErr("E-mail ou senha inválidos.");
      }
    } finally {
      setLoading(false);
    }
  };


  const google = async () => {
    setErr(null);
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (res.error) {
      setErr(res.error.message ?? "Falha ao entrar com Google");
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
          <div className="mb-5 flex rounded-2xl bg-muted p-1">
            <button onClick={() => setMode("login")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${mode === "login" ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"}`}>
              Entrar
            </button>
            <button onClick={() => setMode("signup")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${mode === "signup" ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"}`}>
              Criar conta
            </button>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">
            {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Entre para ver suas vagas e candidaturas." : "É grátis. Leva menos de 1 minuto."}
          </p>

          {mode === "signup" && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Eu sou</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRole("candidato")}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition ${role === "candidato" ? "border-accent bg-accent/5" : "border-border bg-card"}`}>
                  <HardHat className={`h-6 w-6 ${role === "candidato" ? "text-accent" : "text-muted-foreground"}`} />
                  <span className="text-sm font-bold">Candidato</span>
                </button>
                <button type="button" onClick={() => setRole("empresa")}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition ${role === "empresa" ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                  <Building2 className={`h-6 w-6 ${role === "empresa" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-bold">Empresa</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <>
                <Field icon={<UserIcon className="h-4 w-4" />} label={role === "empresa" ? "Seu nome" : "Nome completo"}>
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120}
                    className="h-12 w-full rounded-xl border-2 border-border bg-background pl-10 pr-3 outline-none focus:border-primary" />
                </Field>
                {role === "empresa" && (
                  <Field icon={<Building2 className="h-4 w-4" />} label="Nome da empresa">
                    <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={120}
                      className="h-12 w-full rounded-xl border-2 border-border bg-background pl-10 pr-3 outline-none focus:border-primary" />
                  </Field>
                )}
                {role === "empresa" && (
                  <Field icon={<FileText className="h-4 w-4" />} label="CPF ou CNPJ (para emitir cobranças)">
                    <input required value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} inputMode="numeric" placeholder="Apenas números" maxLength={20}
                      className="h-12 w-full rounded-xl border-2 border-border bg-background pl-10 pr-3 outline-none focus:border-primary" />
                  </Field>
                )}
                <Field icon={<Phone className="h-4 w-4" />} label="WhatsApp">
                  <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" placeholder="(11) 98765-4321"
                    className="h-12 w-full rounded-xl border-2 border-border bg-background pl-10 pr-3 outline-none focus:border-primary" />
                </Field>
              </>
            )}
            <Field icon={<Mail className="h-4 w-4" />} label="E-mail">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160}
                className="h-12 w-full rounded-xl border-2 border-border bg-background pl-10 pr-3 outline-none focus:border-primary" />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Senha">
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6}
                className="h-12 w-full rounded-xl border-2 border-border bg-background pl-10 pr-3 outline-none focus:border-primary" />
            </Field>

            {err && <p className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">{err}</p>}
            {info && <p className="rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary">{info}</p>}

            <button disabled={loading} type="submit"
              className="btn-touch shadow-pop flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground disabled:opacity-60">
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar minha conta"}
            </button>

            {mode === "login" && (
              <button
                type="button"
                onClick={handleReset}
                disabled={resetLoading}
                className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-60"
              >
                {resetLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Esqueci minha senha
              </button>
            )}
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold uppercase text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button onClick={google} disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-border bg-card py-3 text-sm font-bold transition hover:bg-secondary disabled:opacity-60">
            <GoogleIcon /> Continuar com Google
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao continuar você concorda com os Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">{label}</span>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
        {children}
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 18.9 13 24 13c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.2 5.3C41.5 35.7 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
  );
}
