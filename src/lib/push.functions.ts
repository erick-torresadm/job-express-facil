import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Devolve a chave pública VAPID (segura para expor). */
export const getVapidPublicKey = createServerFn({ method: "GET" }).handler(async () => {
  return { publicKey: process.env.VAPID_PUBLIC_KEY ?? "" };
});

const SaveSchema = z.object({
  endpoint: z.string().url().max(500),
  p256dh: z.string().min(1).max(200),
  auth: z.string().min(1).max(200),
  userAgent: z.string().max(500).optional().nullable(),
});

/** Salva/atualiza a assinatura push do usuário autenticado. */
export const savePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SaveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("push_subscriptions").upsert(
      {
        user_id: context.userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        user_agent: data.userAgent ?? null,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const DeleteSchema = z.object({ endpoint: z.string().url().max(500) });

export const deletePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => DeleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", context.userId)
      .eq("endpoint", data.endpoint);
    return { ok: true as const };
  });

/** Manda uma notificação de teste para o próprio usuário. */
export const sendTestPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: subs } = await context.supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", context.userId);
    if (!subs || subs.length === 0) return { ok: false as const, reason: "no_subs" };

    const { sendPushBatch } = await import("./push.server");
    const res = await sendPushBatch(subs, {
      title: "🎉 Notificações ativadas!",
      body: "Você vai receber avisos de novos cadastros e vagas por aqui.",
      url: "/admin",
      tag: "test",
    });
    return { ok: true as const, ...res };
  });
