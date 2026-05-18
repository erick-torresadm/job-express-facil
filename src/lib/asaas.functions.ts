import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Sandbox por padrão; trocar para https://api.asaas.com/v3 em produção
const ASAAS_BASE = "https://api-sandbox.asaas.com/v3";

const PRECOS = {
  basico: { mensal: 44.9, anual: Math.round(44.9 * 12 * 0.8 * 100) / 100 },
  full: { mensal: 82.4, anual: Math.round(82.4 * 12 * 0.8 * 100) / 100 },
} as const;

function asaasHeaders() {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY não configurada");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    access_token: key,
    "User-Agent": "VagasAgora/1.0",
  };
}

async function asaas<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ASAAS_BASE}${path}`, {
    ...init,
    headers: { ...asaasHeaders(), ...(init?.headers ?? {}) },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Asaas ${res.status}: ${body}`);
  return JSON.parse(body) as T;
}

type AsaasCustomer = { id: string; cpfCnpj?: string | null };
type AsaasSubscription = { id: string; nextDueDate: string };
type AsaasPayment = { id: string; invoiceUrl: string; status: string };

function customerHasCpfCnpj(customer: AsaasCustomer, cpfCnpj: string) {
  return customer.cpfCnpj?.replace(/\D/g, "") === cpfCnpj;
}

export const criarAssinaturaAsaas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        plano: z.enum(["basico", "full"]),
        ciclo: z.enum(["mensal", "anual"]),
        nome: z.string().trim().min(2).max(120),
        email: z.string().trim().email(),
        cpfCnpj: z.string().trim().min(11).max(20),
        telefone: z.preprocess((v) => {
          if (typeof v !== "string") return undefined;
          const t = v.trim();
          return t.length === 0 ? undefined : t;
        }, z.string().min(8).max(20).optional()),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const valor = PRECOS[data.plano][data.ciclo];

    const cpfLimpo = data.cpfCnpj.replace(/\D/g, "");
    if (cpfLimpo.length !== 11 && cpfLimpo.length !== 14) {
      throw new Error("CPF (11 dígitos) ou CNPJ (14 dígitos) inválido.");
    }

    // 1) Reutiliza ou cria customer
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("asaas_customer_id, cpf_cnpj")
      .eq("id", userId)
      .maybeSingle();

    let customerId = profile?.asaas_customer_id ?? null;

    const customerPayload = {
      name: data.nome,
      email: data.email,
      cpfCnpj: cpfLimpo,
      mobilePhone: data.telefone?.replace(/\D/g, ""),
      externalReference: userId,
      notificationDisabled: false,
    };

    let needsCreate = !customerId;

    if (customerId) {
      // Verifica se o customer existe e tem cpfCnpj preenchido
      try {
        const existing = await asaas<AsaasCustomer>(`/customers/${customerId}`, { method: "GET" });
        // Sempre força update para garantir cpfCnpj atualizado
        const updated = customerHasCpfCnpj(existing, cpfLimpo)
          ? existing
          : await asaas<AsaasCustomer>(`/customers/${customerId}`, {
              method: "PUT",
              body: JSON.stringify(customerPayload),
            });
        if (!customerHasCpfCnpj(updated, cpfLimpo)) {
          // Update não persistiu — recria
          needsCreate = true;
        }
      } catch {
        // Customer não existe mais no Asaas (ex.: trocou de ambiente)
        needsCreate = true;
      }
    }

    if (needsCreate) {
      const customer = await asaas<AsaasCustomer>("/customers", {
        method: "POST",
        body: JSON.stringify(customerPayload),
      });
      customerId = customer.id;
      if (!customerHasCpfCnpj(customer, cpfLimpo)) {
        throw new Error("Asaas não aceitou o CPF/CNPJ informado. Confira os dados e tente novamente.");
      }
    }

    if (!customerId) {
      throw new Error("Não foi possível criar o cadastro do cliente na Asaas.");
    }

    await supabaseAdmin
      .from("profiles")
      .update({ asaas_customer_id: customerId, cpf_cnpj: cpfLimpo })
      .eq("id", userId);

    // 2) Cria a assinatura recorrente com cobrança no cartão de crédito.
    // O checkout da Asaas vai capturar o cartão e usar o mesmo nas próximas cobranças.
    const nextDueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const cycle = data.ciclo === "anual" ? "YEARLY" : "MONTHLY";
    const billingType = "CREDIT_CARD";
    const subscription = await asaas<AsaasSubscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        customer: customerId,
        billingType,
        value: valor,
        nextDueDate,
        cycle,
        description: `VagasAgora — Plano ${data.plano} (${data.ciclo})`,
        externalReference: `vagasagora:${userId}:${data.plano}:${data.ciclo}`,
      }),
    });

    // 3) Persiste a assinatura local (status pendente até webhook confirmar pagamento)
    await supabaseAdmin.from("assinaturas").insert({
      empresa_id: userId,
      plano: data.plano,
      ciclo: data.ciclo,
      status: "pendente",
      valor,
      asaas_customer_id: customerId,
      asaas_subscription_id: subscription.id,
      proximo_vencimento: subscription.nextDueDate,
    });

    // 4) Pega a primeira cobrança e devolve a invoiceUrl pra redirecionar
    const payments = await asaas<{ data: AsaasPayment[] }>(
      `/payments?subscription=${subscription.id}&limit=1`,
    );
    const invoiceUrl = payments.data?.[0]?.invoiceUrl;
    if (!invoiceUrl) throw new Error("Asaas não retornou link de pagamento");

    return { invoiceUrl, subscriptionId: subscription.id };
  });

// ============= Checkout transparente: assina já com cartão tokenizado =============
export const criarAssinaturaCartao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        plano: z.enum(["basico", "full"]),
        ciclo: z.enum(["mensal", "anual"]),
        nome: z.string().trim().min(2).max(120),
        email: z.string().trim().email(),
        cpfCnpj: z.string().trim().min(11).max(20),
        telefone: z.string().trim().min(10).max(20),
        cep: z.string().trim().min(8).max(9),
        numeroEndereco: z.string().trim().min(1).max(10),
        cartao: z.object({
          holderName: z.string().trim().min(2).max(80),
          number: z.string().trim().min(13).max(19),
          expiryMonth: z.string().trim().regex(/^(0?[1-9]|1[0-2])$/),
          expiryYear: z.string().trim().regex(/^\d{2,4}$/),
          ccv: z.string().trim().regex(/^\d{3,4}$/),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const valor = PRECOS[data.plano][data.ciclo];

    const cpfLimpo = data.cpfCnpj.replace(/\D/g, "");
    if (cpfLimpo.length !== 11 && cpfLimpo.length !== 14) {
      throw new Error("CPF (11 dígitos) ou CNPJ (14 dígitos) inválido.");
    }
    const telLimpo = data.telefone.replace(/\D/g, "");
    const cepLimpo = data.cep.replace(/\D/g, "");
    const cartaoLimpo = {
      holderName: data.cartao.holderName,
      number: data.cartao.number.replace(/\s|\D/g, ""),
      expiryMonth: data.cartao.expiryMonth.padStart(2, "0"),
      expiryYear: data.cartao.expiryYear.length === 2 ? `20${data.cartao.expiryYear}` : data.cartao.expiryYear,
      ccv: data.cartao.ccv,
    };

    // 1) Reutiliza/cria customer com cpfCnpj
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("asaas_customer_id")
      .eq("id", userId)
      .maybeSingle();

    const customerPayload = {
      name: data.nome,
      email: data.email,
      cpfCnpj: cpfLimpo,
      mobilePhone: telLimpo,
      postalCode: cepLimpo,
      externalReference: userId,
      notificationDisabled: false,
    };

    let customerId = profile?.asaas_customer_id ?? null;
    let needsCreate = !customerId;
    if (customerId) {
      try {
        const existing = await asaas<AsaasCustomer>(`/customers/${customerId}`, { method: "GET" });
        if (!customerHasCpfCnpj(existing, cpfLimpo)) {
          await asaas<AsaasCustomer>(`/customers/${customerId}`, {
            method: "PUT",
            body: JSON.stringify(customerPayload),
          });
        }
      } catch {
        needsCreate = true;
      }
    }
    if (needsCreate) {
      const created = await asaas<AsaasCustomer>("/customers", {
        method: "POST",
        body: JSON.stringify(customerPayload),
      });
      customerId = created.id;
    }
    if (!customerId) throw new Error("Não foi possível criar o cliente na Asaas.");

    await supabaseAdmin
      .from("profiles")
      .update({ asaas_customer_id: customerId, cpf_cnpj: cpfLimpo })
      .eq("id", userId);

    // 2) Cria assinatura com cartão tokenizado (checkout transparente)
    const nextDueDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const cycle = data.ciclo === "anual" ? "YEARLY" : "MONTHLY";

    let subscription: AsaasSubscription;
    try {
      subscription = await asaas<AsaasSubscription>("/subscriptions", {
        method: "POST",
        body: JSON.stringify({
          customer: customerId,
          billingType: "CREDIT_CARD",
          value: valor,
          nextDueDate,
          cycle,
          description: `VagasAgora — Plano ${data.plano} (${data.ciclo})`,
          externalReference: `vagasagora:${userId}:${data.plano}:${data.ciclo}`,
          creditCard: cartaoLimpo,
          creditCardHolderInfo: {
            name: data.nome,
            email: data.email,
            cpfCnpj: cpfLimpo,
            postalCode: cepLimpo,
            addressNumber: data.numeroEndereco,
            phone: telLimpo,
            mobilePhone: telLimpo,
          },
        }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro no cartão";
      // Mensagens mais claras pro usuário
      if (/invalid_creditCard|invalid_credit_card|invalid_card|credit_card_number/i.test(msg)) {
        throw new Error("Cartão recusado: confira número, validade e CVV.");
      }
      if (/invalid_postalCode|invalid_postal_code|cep/i.test(msg)) {
        throw new Error("CEP inválido. Confira e tente novamente.");
      }
      throw new Error(msg.replace(/^Asaas \d+:\s*/, "").slice(0, 240));
    }

    // 3) Persiste assinatura ativa (cartão já cobrado/aprovado)
    await supabaseAdmin.from("assinaturas").insert({
      empresa_id: userId,
      plano: data.plano,
      ciclo: data.ciclo,
      status: "ativa",
      valor,
      asaas_customer_id: customerId,
      asaas_subscription_id: subscription.id,
      proximo_vencimento: subscription.nextDueDate,
    });

    return { ok: true as const, subscriptionId: subscription.id };
  });

export const minhaAssinatura = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("assinaturas")
      .select("id, plano, ciclo, status, valor, proximo_vencimento, created_at")
      .eq("empresa_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  });
