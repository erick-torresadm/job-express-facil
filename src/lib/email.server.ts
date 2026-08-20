// Envio de e-mail transacional via Resend (server-only).
import { SITE_NAME } from "@/lib/site";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; err?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, err: "RESEND_API_KEY ausente" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${SITE_NAME} <no-reply@vagasagora.com.br>`,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });
  if (!res.ok) return { ok: false, err: `resend ${res.status}: ${await res.text().catch(() => "")}` };
  return { ok: true };
}
