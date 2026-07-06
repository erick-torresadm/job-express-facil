// Helper server-only para disparar push a TODOS os admins.
// Persistente: usa supabaseAdmin (não depende da sessão do chamador),
// então funciona mesmo em fluxos anônimos (candidatura, cadastro).

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendPushBatch, type PushPayload } from "@/lib/push.server";

export async function notifyAdminsPush(payload: PushPayload): Promise<void> {
  try {
    const { data: adminRoles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    const adminIds = (adminRoles ?? []).map((r) => r.user_id);
    if (adminIds.length === 0) return;

    const { data: subs } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .in("user_id", adminIds);
    if (!subs || subs.length === 0) return;

    const result = await sendPushBatch(subs, payload);
    if (result.invalidEndpoints.length > 0) {
      await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .in("endpoint", result.invalidEndpoints);
    }
  } catch (err) {
    console.error("[notifyAdminsPush] erro", err);
  }
}
