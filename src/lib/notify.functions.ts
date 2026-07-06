import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// E-mail que recebe os avisos de novos cadastros
const ADMIN_TO = "contato@vagasagora.com.br";
const FROM = "VagasAgora <contato@vagasagora.com.br>";

const InputSchema = z.object({
  tipo: z.enum(["candidato", "empresa"]),
  nome: z.string().trim().min(1).max(200),
  email: z.string().email().max(200),
  whatsapp: z.string().max(30).optional().nullable(),
  empresa: z.string().max(200).optional().nullable(),
  cidade: z.string().max(120).optional().nullable(),
});

/**
 * Envia um e-mail para o admin toda vez que um novo candidato ou empresa
 * se cadastra. Fire-and-forget do lado do cliente: falhas NÃO devem quebrar
 * o cadastro. Endpoint público (sem auth) porque é chamado durante o próprio
 * fluxo de signup, quando a sessão ainda pode não estar disponível.
 */
export const notifyNewSignup = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.RESEND_API_KEY;
    const label = data.tipo === "empresa" ? "Nova EMPRESA" : "Novo CANDIDATO";
    const subject = `[VagasAgora] ${label}: ${data.nome}`;

    const rows: [string, string][] = [
      ["Tipo", data.tipo],
      ["Nome", data.nome],
      ["E-mail", data.email],
    ];
    if (data.whatsapp) rows.push(["WhatsApp", data.whatsapp]);
    if (data.empresa) rows.push(["Empresa", data.empresa]);
    if (data.cidade) rows.push(["Cidade", data.cidade]);
    rows.push(["Quando", new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })]);

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0F172A;color:#fff;border-radius:16px">
        <h2 style="margin:0 0 12px 0;font-size:20px">${label} no VagasAgora</h2>
        <p style="margin:0 0 20px 0;color:#cbd5e1">Um novo cadastro acabou de acontecer.</p>
        <table style="width:100%;border-collapse:collapse;background:#fff;color:#0f172a;border-radius:12px;overflow:hidden">
          <tbody>
            ${rows
              .map(
                ([k, v]) => `
              <tr>
                <td style="padding:10px 14px;font-weight:700;background:#f1f5f9;width:120px">${k}</td>
                <td style="padding:10px 14px">${escapeHtml(v)}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
        <p style="margin:20px 0 0 0;font-size:12px;color:#94a3b8">
          Enviado automaticamente pelo VagasAgora · admin em <a style="color:#a5b4fc" href="https://vagasagora.com.br/admin">/admin</a>
        </p>
      </div>`;

    const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

    if (key) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            from: FROM,
            to: [ADMIN_TO],
            subject,
            html,
            text,
            reply_to: data.email,
          }),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          console.error(`[notifyNewSignup] Resend ${res.status}: ${body}`);
        }
      } catch (err) {
        console.error("[notifyNewSignup] erro email", err);
      }
    } else {
      console.warn("[notifyNewSignup] RESEND_API_KEY ausente — email pulado.");
    }

    // Push notification para admins (fire-and-forget)
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: adminRoles } = await supabaseAdmin
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminIds = (adminRoles ?? []).map((r) => r.user_id);
      if (adminIds.length > 0) {
        const { data: subs } = await supabaseAdmin
          .from("push_subscriptions")
          .select("endpoint, p256dh, auth")
          .in("user_id", adminIds);
        if (subs && subs.length > 0) {
          const { sendPushBatch } = await import("./push.server");
          const result = await sendPushBatch(subs, {
            title: label,
            body: `${data.nome}${data.empresa ? ` · ${data.empresa}` : ""}`,
            url: "/admin/usuarios",
            tag: `signup-${data.tipo}`,
          });
          if (result.invalidEndpoints.length > 0) {
            await supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .in("endpoint", result.invalidEndpoints);
          }
        }
      }
    } catch (err) {
      console.error("[notifyNewSignup] erro push", err);
    }

    return { ok: true as const };
  });

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
