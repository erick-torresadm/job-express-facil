import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles, Loader2, X, CreditCard, QrCode, Lock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { criarAssinaturaAsaas, criarAssinaturaCartao } from "@/lib/asaas.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos para empresas — VagasAgora" },
      { name: "description", content: "A partir de R$ 44,90/mês. Até 25% mais barato que Catho, Infojobs e Vagas.com. 10 contatos grátis para começar." },
      { property: "og:title", content: "Planos para empresas — VagasAgora" },
      { property: "og:description", content: "R$ 44,90/mês no Básico ou R$ 82,40/mês no Full. Mais barato que a concorrência." },
    ],
  }),
  component: PlanosPage,
});

const DESCONTO_ANUAL = 0.2;
const PRECO_BASICO = 44.9;
const PRECO_FULL = 82.4;

const brl = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
          <Sparkles className="h-3 w-3" /> Até 25% mais barato que Catho, Infojobs e Vagas.com
        </span>
        <h1 className="mt-4 text-4xl font-extrabold lg:text-5xl">Contrate sem perder tempo</h1>
        <p className="mt-3 text-muted-foreground">Comece com 10 contatos grátis. Sem fidelidade — cancele quando quiser.</p>

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
          preco={ciclo === "mensal" ? `R$ ${brl(PRECO_BASICO)}` : `R$ ${brl(PRECO_BASICO * 12 * (1 - DESCONTO_ANUAL))}`}
          subtitulo={ciclo === "mensal" ? "por mês" : "por ano"}
          comparativo="Catho Profissional: R$ 59,90/mês"
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
          preco={ciclo === "mensal" ? `R$ ${brl(PRECO_FULL)}` : `R$ ${brl(PRECO_FULL * 12 * (1 - DESCONTO_ANUAL))}`}
          subtitulo={ciclo === "mensal" ? "por mês" : "por ano"}
          comparativo="Catho Destaque: R$ 109,90/mês"
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
          Cartão de crédito (recorrente), Pix ou boleto. Sem fidelidade.
        </p>
      </section>

      {checkout && (
        <CheckoutModal plano={checkout.plano} ciclo={ciclo} onClose={() => setCheckout(null)} />
      )}
    </div>
  );
}

function PlanoCard({ nome, preco, subtitulo, features, cta, onClick, destaque, comparativo }: {
  nome: string; preco: string; subtitulo: string;
  features: string[]; cta: string;
  onClick: "link-auth" | (() => void);
  destaque?: boolean;
  comparativo?: string;
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
      {comparativo && (
        <p className="mt-1 text-[11px] font-bold text-accent-foreground">↓ {comparativo}</p>
      )}
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

type Metodo = "cartao" | "pix";

function CheckoutModal({ plano, ciclo, onClose }: {
  plano: "basico" | "full"; ciclo: "mensal" | "anual"; onClose: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const criarCartao = useServerFn(criarAssinaturaCartao);
  const criarHosted = useServerFn(criarAssinaturaAsaas);

  const [metodo, setMetodo] = useState<Metodo>("cartao");
  const [form, setForm] = useState({
    nome: user?.user_metadata?.company_name ?? user?.user_metadata?.full_name ?? "",
    email: user?.email ?? "",
    cpfCnpj: "",
    telefone: user?.user_metadata?.whatsapp ?? "",
    cep: "",
    numeroEndereco: "",
  });
  const [cartao, setCartao] = useState({
    holderName: "",
    number: "",
    expiry: "",
    ccv: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);

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
          ...f,
          nome: f.nome || data.company_name || data.full_name || "",
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
  const cepDigits = form.cep.replace(/\D/g, "");
  const cartaoDigits = cartao.number.replace(/\D/g, "");
  const [mm, yy] = cartao.expiry.split("/").map((s) => s?.trim() ?? "");
  const cpfValido = cpfDigits.length === 11 || cpfDigits.length === 14;
  const telValido = telDigits.length >= 10;
  const baseValido = form.nome.trim().length >= 2 && form.email.includes("@") && cpfValido && telValido;
  const cartaoValido =
    cartao.holderName.trim().length >= 2 &&
    cartaoDigits.length >= 13 &&
    !!mm && !!yy &&
    /^\d{3,4}$/.test(cartao.ccv) &&
    cepDigits.length === 8 &&
    form.numeroEndereco.trim().length >= 1;

  const podeEnviar = !loading && baseValido && (metodo === "pix" || cartaoValido);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Entre na sua conta para assinar");
      navigate({ to: "/auth" });
      return;
    }
    setLoading(true);
    try {
      if (metodo === "cartao") {
        await criarCartao({
          data: {
            plano, ciclo,
            nome: form.nome.trim(),
            email: form.email.trim(),
            cpfCnpj: cpfDigits,
            telefone: telDigits,
            cep: cepDigits,
            numeroEndereco: form.numeroEndereco.trim(),
            cartao: {
              holderName: cartao.holderName.trim(),
              number: cartaoDigits,
              expiryMonth: mm,
              expiryYear: yy,
              ccv: cartao.ccv,
            },
          },
        });
        toast.success("Assinatura ativada! Bem-vindo ao VagasAgora 🎉");
        navigate({ to: "/empresa" });
      } else {
        const { invoiceUrl } = await criarHosted({
          data: {
            plano, ciclo,
            nome: form.nome.trim(),
            email: form.email.trim(),
            cpfCnpj: cpfDigits,
            telefone: telDigits || undefined,
          },
        });
        window.location.href = invoiceUrl;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao processar pagamento");
      setLoading(false);
    }
  };

  const valor = plano === "basico" ? PRECO_BASICO : PRECO_FULL;
  const total = ciclo === "mensal" ? valor : valor * 12 * (1 - DESCONTO_ANUAL);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 overflow-y-auto" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-md rounded-3xl bg-card p-6 shadow-pop">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-extrabold">Plano {plano === "basico" ? "Básico" : "Full"}</h3>
            <p className="text-xs text-muted-foreground">
              {ciclo === "mensal" ? `R$ ${brl(total)}/mês` : `R$ ${brl(total)} no ano (20% off)`}
            </p>
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
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMetodo("cartao")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                  metodo === "cartao" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}>
                <CreditCard className="h-4 w-4" /> Cartão (recorrente)
              </button>
              <button type="button" onClick={() => setMetodo("pix")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                  metodo === "pix" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}>
                <QrCode className="h-4 w-4" /> Pix / Boleto
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <Field label="Nome / Razão social" value={form.nome}
                onChange={(v) => setForm((f) => ({ ...f, nome: v }))} required />
              <Field label="E-mail" type="email" value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))} required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="CPF/CNPJ" value={form.cpfCnpj}
                  onChange={(v) => setForm((f) => ({ ...f, cpfCnpj: v }))} required />
                <Field label="WhatsApp" value={form.telefone}
                  onChange={(v) => setForm((f) => ({ ...f, telefone: v }))}
                  placeholder="11999999999" required />
              </div>

              {metodo === "cartao" && (
                <div className="mt-2 space-y-3 rounded-2xl border border-border bg-secondary/40 p-3">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                    <Lock className="h-3 w-3" /> Pagamento seguro — dados criptografados via Asaas
                  </div>
                  <Field label="Nome impresso no cartão" value={cartao.holderName}
                    onChange={(v) => setCartao((c) => ({ ...c, holderName: v }))} required />
                  <Field label="Número do cartão" value={cartao.number}
                    onChange={(v) => setCartao((c) => ({ ...c, number: v.replace(/[^\d ]/g, "").slice(0, 19) }))}
                    placeholder="0000 0000 0000 0000" required />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Validade (MM/AA)" value={cartao.expiry}
                      onChange={(v) => {
                        const d = v.replace(/\D/g, "").slice(0, 4);
                        const formatted = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
                        setCartao((c) => ({ ...c, expiry: formatted }));
                      }}
                      placeholder="12/29" required />
                    <Field label="CVV" value={cartao.ccv}
                      onChange={(v) => setCartao((c) => ({ ...c, ccv: v.replace(/\D/g, "").slice(0, 4) }))}
                      placeholder="123" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="CEP do titular" value={form.cep}
                      onChange={(v) => setForm((f) => ({ ...f, cep: v.replace(/\D/g, "").slice(0, 8) }))}
                      placeholder="00000000" required />
                    <Field label="Nº do endereço" value={form.numeroEndereco}
                      onChange={(v) => setForm((f) => ({ ...f, numeroEndereco: v }))}
                      placeholder="123" required />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={!podeEnviar}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-foreground disabled:opacity-60">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processando…</>
              ) : metodo === "cartao" ? (
                <><Lock className="h-4 w-4" /> Pagar R$ {brl(total)}</>
              ) : (
                "Gerar Pix / Boleto →"
              )}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              {metodo === "cartao"
                ? "Cobrança recorrente no cartão. Cancele a qualquer momento."
                : "Você será redirecionado para o ambiente seguro do Asaas."}
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
