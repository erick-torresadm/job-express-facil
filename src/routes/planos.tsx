import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles, Loader2, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { criarAssinaturaAsaas } from "@/lib/asaas.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos para empresas — VagasAgora" },
      { name: "description", content: "R$99/mês no plano Básico ou R$299/mês no Full. Pague anual e economize 20%. Comece grátis com 10 contatos liberados." },
      { property: "og:title", content: "Planos para empresas — VagasAgora" },
      { property: "og:description", content: "10 contatos grátis. Depois R$99/mês ou R$299/mês. Desconto no anual." },
    ],
  }),
  component: PlanosPage,
});

const DESCONTO_ANUAL = 0.2;

function PlanosPage() {
  const [ciclo, setCiclo] = useState<"mensal" | "anual">("mensal");
  const [checkout, setCheckout] = useState<null | { plano: "basico" | "full" }>(null);

  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-extrabold">VagasAgora</Link>
          <Link to="/empresa" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Sou empresa</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12 text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent-foreground">
          <Sparkles className="h-3 w-3" /> 10 contatos grátis para começar
        </span>
        <h1 className="mt-4 text-4xl font-extrabold lg:text-5xl">Contrate sem perder tempo</h1>
        <p className="mt-3 text-muted-foreground">Cobre só por candidato que você quiser falar. Cancele quando quiser.</p>

        <div className="mt-6 inline-flex rounded-full bg-card p-1 shadow-soft">
          {(["mensal", "anual"] as const).map((c) => (
            <button key={c} onClick={() => setCiclo(c)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                ciclo === c ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}>
              {c === "mensal" ? "Mensal" : "Anual (-20%)"}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-16 lg:grid-cols-3">
        <PlanoCard
          nome="Free"
          preco="R$ 0" subtitulo="Para experimentar"
          features={["10 contatos liberados", "Acesso a todos os currículos", "1 vaga ativa", "Suporte por e-mail"]}
          cta="Começar grátis" onClick="link-auth"
        />
        <PlanoCard
          nome="Básico" destaque
          preco={ciclo === "mensal" ? "R$ 99" : `R$ ${Math.round(99 * 12 * (1 - DESCONTO_ANUAL)).toLocaleString("pt-BR")}`}
          subtitulo={ciclo === "mensal" ? "por mês" : "por ano"}
          features={[
            "100 contatos liberados/mês",
            "5 vagas ativas simultâneas",
            "Página personalizada (logo + cor)",
            "Notificações de novos candidatos",
            "Filtros por bairro e profissão",
          ]}
          cta="Assinar Básico" onClick={() => setCheckout({ plano: "basico" })}
        />
        <PlanoCard
          nome="Full"
          preco={ciclo === "mensal" ? "R$ 299" : `R$ ${Math.round(299 * 12 * (1 - DESCONTO_ANUAL)).toLocaleString("pt-BR")}`}
          subtitulo={ciclo === "mensal" ? "por mês" : "por ano"}
          features={[
            "Contatos ilimitados",
            "Vagas ilimitadas",
            "Perguntas extras no formulário",
            "Match automático por IA",
            "Detecção de fraude e salário sugerido",
            "Suporte prioritário",
          ]}
          cta="Assinar Full" onClick={() => setCheckout({ plano: "full" })}
        />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 text-center">
        <p className="text-sm text-muted-foreground">
          Pagando anual: <strong className="text-foreground">20% de desconto</strong>.
          Pix, cartão ou boleto. Sem fidelidade. Cancele quando quiser.
        </p>
      </section>

      {checkout && (
        <CheckoutModal plano={checkout.plano} ciclo={ciclo} onClose={() => setCheckout(null)} />
      )}
    </div>
  );
}

function PlanoCard({ nome, preco, subtitulo, features, cta, onClick, destaque }: {
  nome: string; preco: string; subtitulo: string;
  features: string[]; cta: string;
  onClick: "link-auth" | (() => void);
  destaque?: boolean;
}) {
  const isLink = onClick === "link-auth";
  const btnCls = `mt-6 inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold ${
    destaque ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-secondary text-foreground hover:bg-accent/20"
  }`;
  return (
    <article className={`relative rounded-3xl border bg-card p-6 ${destaque ? "border-primary shadow-lg ring-2 ring-primary/30" : "border-border"}`}>
      {destaque && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-extrabold uppercase text-primary-foreground">
          Mais popular
        </span>
      )}
      <h3 className="text-xl font-extrabold">{nome}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold">{preco}</span>
        <span className="text-sm text-muted-foreground">{subtitulo}</span>
      </div>
      <ul className="mt-6 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {f}
          </li>
        ))}
      </ul>
      {isLink ? (
        <Link to="/auth" className={btnCls}>{cta}</Link>
      ) : (
        <button onClick={onClick} className={btnCls}>{cta}</button>
      )}
    </article>
  );
}

function CheckoutModal({ plano, ciclo, onClose }: {
  plano: "basico" | "full"; ciclo: "mensal" | "anual"; onClose: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const criar = useServerFn(criarAssinaturaAsaas);
  const [form, setForm] = useState({
    nome: user?.user_metadata?.company_name ?? user?.user_metadata?.full_name ?? "",
    email: user?.email ?? "",
    cpfCnpj: "",
    telefone: user?.user_metadata?.whatsapp ?? "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);

  // Puxa dados do perfil para preencher automaticamente
  useEffect(() => {
    if (!user) { setLoadingProfile(false); return; }
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, company_name, whatsapp, cpf_cnpj")
        .eq("id", user.id)
        .maybeSingle();
      if (cancel) return;
      if (data) {
        setForm((f) => ({
          nome: f.nome || data.company_name || data.full_name || "",
          email: f.email,
          cpfCnpj: f.cpfCnpj || data.cpf_cnpj || "",
          telefone: f.telefone || data.whatsapp || "",
        }));
      }
      setLoadingProfile(false);
    })();
    return () => { cancel = true; };
  }, [user]);

  const cpfDigits = form.cpfCnpj.replace(/\D/g, "");
  const telDigits = form.telefone.replace(/\D/g, "");
  const cpfValido = cpfDigits.length === 11 || cpfDigits.length === 14;
  const telValido = telDigits.length === 0 || telDigits.length >= 10;
  const podeEnviar = !loading && form.nome.trim().length >= 2 && form.email.includes("@") && cpfValido && telValido;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Entre na sua conta para assinar");
      navigate({ to: "/auth" });
      return;
    }
    if (!cpfValido) {
      toast.error("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }
    setLoading(true);
    try {
      const { invoiceUrl } = await criar({
        data: {
          plano,
          ciclo,
          nome: form.nome.trim(),
          email: form.email.trim(),
          cpfCnpj: cpfDigits,
          telefone: telDigits || undefined,
        },
      });
      window.location.href = invoiceUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar assinatura");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-card p-6 shadow-pop">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-extrabold">Assinar plano {plano === "basico" ? "Básico" : "Full"}</h3>
            <p className="text-xs text-muted-foreground">{ciclo === "mensal" ? "Cobrança mensal — escolha cartão, Pix ou boleto no checkout" : "Cobrança anual — escolha cartão, Pix ou boleto no checkout"}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loadingProfile ? (
          <div className="mt-6 flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando seus dados…
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              <Field label="Nome / Razão social" value={form.nome}
                onChange={(v) => setForm((f) => ({ ...f, nome: v }))} required />
              <Field label="E-mail" type="email" value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))} required />
              <div>
                <Field label="CPF ou CNPJ" value={form.cpfCnpj}
                  onChange={(v) => setForm((f) => ({ ...f, cpfCnpj: v }))}
                  placeholder="Apenas números" required />
                {form.cpfCnpj && !cpfValido && (
                  <p className="mt-1 text-[11px] text-destructive">Use 11 dígitos (CPF) ou 14 (CNPJ).</p>
                )}
              </div>
              <div>
                <Field label="WhatsApp (com DDD)" value={form.telefone}
                  onChange={(v) => setForm((f) => ({ ...f, telefone: v }))}
                  placeholder="11999999999" />
                {form.telefone && !telValido && (
                  <p className="mt-1 text-[11px] text-destructive">Informe pelo menos 10 dígitos (DDD + número).</p>
                )}
              </div>
            </div>

            <button type="submit" disabled={!podeEnviar}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-foreground disabled:opacity-60">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando link...</> : "Ir para pagamento →"}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Você será redirecionado para o ambiente seguro do Asaas para escolher Pix, cartão ou boleto.
            </p>
          </>
        )}
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
    </label>
  );
}
