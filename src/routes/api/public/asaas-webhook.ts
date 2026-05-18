import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Webhook do Asaas — recebe eventos de pagamento e atualiza a assinatura local.
// Configurar em: Painel Asaas → Integrações → Webhooks
// URL: https://job-express-facil.lovable.app/api/public/asaas-webhook
// Headers: "asaas-access-token: <token-secreto-definido-pelo-cliente>"
// Marcar eventos: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE,
// PAYMENT_REFUNDED, PAYMENT_DELETED, SUBSCRIPTION_CANCELLED.

type AsaasEvent = {
  event: string;
  payment?: {
    subscription?: string;
    status?: string;
    dueDate?: string;
  };
  subscription?: { id?: string; status?: string };
};

const STATUS_MAP: Record<string, "ativa" | "atrasada" | "cancelada" | "pendente"> = {
  PAYMENT_CONFIRMED: "ativa",
  PAYMENT_RECEIVED: "ativa",
  PAYMENT_OVERDUE: "atrasada",
  PAYMENT_REFUNDED: "cancelada",
  PAYMENT_DELETED: "cancelada",
  SUBSCRIPTION_CANCELLED: "cancelada",
  SUBSCRIPTION_INACTIVATED: "cancelada",
};

export const Route = createFileRoute("/api/public/asaas-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Verificação opcional: se ASAAS_WEBHOOK_TOKEN for definido, exigir o header
        const expected = process.env.ASAAS_WEBHOOK_TOKEN;
        if (expected) {
          const sent = request.headers.get("asaas-access-token");
          if (sent !== expected) return new Response("forbidden", { status: 403 });
        }

        let payload: AsaasEvent;
        try { payload = (await request.json()) as AsaasEvent; }
        catch { return new Response("bad json", { status: 400 }); }

        const novoStatus = STATUS_MAP[payload.event];
        const subscriptionId = payload.payment?.subscription ?? payload.subscription?.id;
        if (!novoStatus || !subscriptionId) {
          return new Response(JSON.stringify({ ok: true, ignored: true }), { status: 200 });
        }

        const update: { status: typeof novoStatus; proximo_vencimento?: string } = { status: novoStatus };
        if (payload.payment?.dueDate) update.proximo_vencimento = payload.payment.dueDate;

        const { error } = await supabaseAdmin
          .from("assinaturas")
          .update(update)
          .eq("asaas_subscription_id", subscriptionId);

        if (error) {
          console.error("Asaas webhook update error", error);
          return new Response("db error", { status: 500 });
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
