// Helper server-only para disparar push a um ou mais usuários específicos.
// Usa supabaseAdmin (não depende da sessão do chamador) — funciona em
// fluxos disparados por webhook/trigger, sem usuário autenticado no request.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendPushBatch, type PushPayload } from "@/lib/push.server";

export async function notifyUsersPush(userIds: string[], payload: PushPayload): Promise<void> {
  if (userIds.length === 0) return;
  try {
    const { data: subs } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .in("user_id", userIds);
    if (!subs || subs.length === 0) return;

    const result = await sendPushBatch(subs, payload);
    if (result.invalidEndpoints.length > 0) {
      await supabaseAdmin.from("push_subscriptions").delete().in("endpoint", result.invalidEndpoints);
    }
  } catch (err) {
    console.error("[notifyUsersPush] erro", err);
  }
}
