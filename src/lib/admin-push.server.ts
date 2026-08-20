// Helper server-only para disparar push a TODOS os admins.
// Persistente: usa supabaseAdmin (não depende da sessão do chamador),
// então funciona mesmo em fluxos anônimos (candidatura, cadastro).

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { PushPayload } from "@/lib/push.server";
import { notifyUsersPush } from "@/lib/push-notify.server";

export async function notifyAdminsPush(payload: PushPayload): Promise<void> {
  const { data: adminRoles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin");
  const adminIds = (adminRoles ?? []).map((r) => r.user_id);
  await notifyUsersPush(adminIds, payload);
}
