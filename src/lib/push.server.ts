// Envio de Web Push (server-only). Roda no worker via nodejs_compat.
import webpush from "web-push";

let configured = false;
function ensureConfigured() {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contato@vagasagora.com.br";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface Subscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** Envia para uma lista de assinaturas. Retorna endpoints inválidos para limpeza. */
export async function sendPushBatch(
  subs: Subscription[],
  payload: PushPayload,
): Promise<{ sent: number; failed: number; invalidEndpoints: string[] }> {
  if (!ensureConfigured()) {
    console.warn("[push] VAPID keys ausentes — pulando envio.");
    return { sent: 0, failed: subs.length, invalidEndpoints: [] };
  }

  const body = JSON.stringify(payload);
  const invalidEndpoints: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
          { TTL: 60 * 60 * 24 },
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        const status = (err as { statusCode?: number })?.statusCode;
        // 404/410 = assinatura expirada/removida → limpar do banco
        if (status === 404 || status === 410) invalidEndpoints.push(s.endpoint);
        else console.error("[push] falha ao enviar", status, err);
      }
    }),
  );

  return { sent, failed, invalidEndpoints };
}
