// Endpoint público chamado pelo Service Worker quando o browser rotaciona
// o endpoint da push subscription (evento `pushsubscriptionchange`).
// Não requer autenticação: identifica a assinatura pelo endpoint antigo,
// que é um segredo por dispositivo — só o próprio SW o conhece. Isso é
// o que garante persistência quando o admin desloga: a assinatura
// continua vinculada ao user_id original no banco.

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Schema = z.object({
  oldEndpoint: z.string().url().max(500),
  newEndpoint: z.string().url().max(500),
  p256dh: z.string().min(1).max(200),
  auth: z.string().min(1).max(200),
});

export const Route = createFileRoute("/api/public/push/renew")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = Schema.parse(body);
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("push_subscriptions")
            .update({
              endpoint: parsed.newEndpoint,
              p256dh: parsed.p256dh,
              auth: parsed.auth,
              last_used_at: new Date().toISOString(),
            })
            .eq("endpoint", parsed.oldEndpoint);
          if (error) return new Response(JSON.stringify({ ok: false }), { status: 500 });
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        }
      },
    },
  },
});
