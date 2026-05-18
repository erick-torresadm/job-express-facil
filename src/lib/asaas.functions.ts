import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Sandbox por padrão; trocar para https://api.asaas.com/v3 em produção
const ASAAS_BASE = "https://api-sandbox.asaas.com/v3";

const PRECOS = {
  basico: { mensal: 99, anual: Math.round(99 * 12 * 0.8) },
  full: { mensal: 299, anual: Math.round(299 * 12 * 0.8) },
} as const;

function asaasHeaders() {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY não configurada");
  return {
    "Content-Type": "application/json",
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

type AsaasCustomer = { id: string };
type AsaasSubscription = { id: string; nextDueDate: string };
type AsaasPayment = { id: string; invoiceUrl: string; status: string };

export const criarAssinaturaAsaas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      plano: z.enum(["basico", "full"]),
      ciclo: z.enum(["mensal", "anual"]),
      nome: z.string().trim().min(2).max(120),
      email: z.string().email(),
      cpfCnpj: z.string().trim().min(11).max(20),
      telefone: z.string().trim().min(8).max(20).optional(),
    }).parse(input),
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

    if (!customerId) {
      const customer = await asaas<AsaasCustomer>("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: data.nome,
          email: data.email,
          cpfCnpj: cpfLimpo,
          mobilePhone: data.telefone?.replace(/\D/g, ""),
          externalReference: userId,
          notificationDisabled: false,
        }),
      });
      customerId = customer.id;
    } else {
      // Atualiza customer existente garantindo que cpfCnpj esteja preenchido
      // (Asaas rejeita cartão de crédito sem CPF/CNPJ no cadastro do cliente)
      await asaas<AsaasCustomer>(`/customers/${customerId}`, {
        method: "POST",
        body: JSON.stringify({
          name: data.nome,
          email: data.email,
          cpfCnpj: cpfLimpo,
          mobilePhone: data.telefone?.replace(/\D/g, ""),
        }),
      });
    }

    await supabaseAdmin
      .from("profiles")
      .update({ asaas_customer_id: customerId, cpf_cnpj: cpfLimpo })
      .eq("id", userId);

    // 2) Cria a assinatura recorrente
    // Mensal: só cartão (recorrência automática). Anual: cartão, PIX ou boleto.
    const nextDueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const cycle = data.ciclo === "anual" ? "YEARLY" : "MONTHLY";
    const billingType = data.ciclo === "mensal" ? "CREDIT_CARD" : "UNDEFINED";
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
