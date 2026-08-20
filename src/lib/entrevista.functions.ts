import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendEmail } from "@/lib/email.server";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// ═══════════════════════════════════════════════════════════════
// CHAMADA PARA ENTREVISTA
// Empresa chama candidato para entrevista via email + WhatsApp
// ═══════════════════════════════════════════════════════════════

const ChamarPraEntrevistaInput = z.object({
  candidato_id: z.string().uuid("ID do candidato inválido"),
  vaga_id: z.string().uuid("ID da vaga inválido"),
  tipo: z.enum(["presencial", "online"], {
    errorMap: () => ({ message: "Tipo deve ser 'presencial' ou 'online'" }),
  }),
  data_sugerida: z
    .string()
    .datetime("Data inválida. Use formato ISO 8601")
    .transform((s) => new Date(s)),
  link_video: z.string().url().max(500).optional().nullable(),
  instrucoes: z.string().trim().max(1000).optional().nullable(),
});

type ChamarPraEntrevistaInput = z.infer<typeof ChamarPraEntrevistaInput>;

interface ChamarPraEntrevistaResponse {
  ok: boolean;
  entrevista_id?: string;
  email_sent?: boolean;
  whatsapp_sent?: boolean;
  error?: string;
}

function formatDataBR(date: Date): string {
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function generateEmailHtml(params: {
  candidatoNome: string;
  vagaTitulo: string;
  empresaNome: string;
  tipo: "presencial" | "online";
  dataSugerida: Date;
  linkVideo?: string | null;
  instrucoes?: string | null;
}): string {
  const { candidatoNome, vagaTitulo, empresaNome, tipo, dataSugerida, linkVideo, instrucoes } = params;
  const dataBR = formatDataBR(dataSugerida);
  const tipoLabel = tipo === "online" ? "Online" : "Presencial";

  const detalhes: string[] = [];
  detalhes.push(
    `<tr>
      <td style="padding:10px 14px;font-weight:700;background:#f1f5f9;width:140px">Tipo</td>
      <td style="padding:10px 14px">${escapeHtml(tipoLabel)}</td>
    </tr>`,
  );
  detalhes.push(
    `<tr>
      <td style="padding:10px 14px;font-weight:700;background:#f1f5f9;width:140px">Data Sugerida</td>
      <td style="padding:10px 14px">${escapeHtml(dataBR)}</td>
    </tr>`,
  );

  if (tipo === "online" && linkVideo) {
    detalhes.push(
      `<tr>
      <td style="padding:10px 14px;font-weight:700;background:#f1f5f9;width:140px">Link da Reunião</td>
      <td style="padding:10px 14px"><a href="${escapeHtml(linkVideo)}" style="color:#6366f1;text-decoration:none;font-weight:500">${escapeHtml(linkVideo)}</a></td>
    </tr>`,
    );
  }

  if (instrucoes) {
    detalhes.push(
      `<tr>
      <td style="padding:10px 14px;font-weight:700;background:#f1f5f9;width:140px;vertical-align:top">Instruções</td>
      <td style="padding:10px 14px">${escapeHtml(instrucoes).replace(/\n/g, "<br>")}</td>
    </tr>`,
    );
  }

  const rescheduleLink = `${SITE_URL}/candidato/entrevistas`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Você foi chamado para entrevista!</title>
    </head>
    <body style="font-family:Arial,Helvetica,sans-serif;margin:0;padding:0;background:#f8fafc">
      <div style="max-width:600px;margin:0 auto;padding:24px">
        <!-- Header -->
        <div style="background:#0F172A;border-radius:16px 16px 0 0;padding:32px 24px;text-align:center">
          <h1 style="margin:0;font-size:28px;color:#fff;font-weight:bold">
            🎉 Parabéns, ${escapeHtml(candidatoNome)}!
          </h1>
          <p style="margin:8px 0 0 0;font-size:14px;color:#cbd5e1">
            Você foi chamado para uma entrevista
          </p>
        </div>

        <!-- Main Content -->
        <div style="background:#fff;padding:32px 24px">
          <p style="margin:0 0 16px 0;color:#0f172a;font-size:14px">
            <strong>${escapeHtml(empresaNome)}</strong> o chamou para uma entrevista sobre a vaga:
          </p>

          <div style="background:#f0f4f8;border-left:4px solid #6366f1;padding:16px;margin:0 0 24px 0;border-radius:4px">
            <p style="margin:0;font-size:16px;font-weight:bold;color:#0f172a">
              ${escapeHtml(vagaTitulo)}
            </p>
          </div>

          <p style="margin:0 0 12px 0;color:#0f172a;font-size:14px;font-weight:bold">
            Detalhes da Entrevista
          </p>

          <table style="width:100%;border-collapse:collapse;background:#fff;color:#0f172a;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0">
            <tbody>
              ${detalhes.join("")}
            </tbody>
          </table>

          <p style="margin:24px 0 0 0;color:#64748b;font-size:13px">
            ${
              tipo === "online"
                ? "Acesse o link acima no horário agendado para participar da entrevista online."
                : "Chegue alguns minutos antes do horário agendado para a entrevista presencial."
            }
          </p>
        </div>

        <!-- CTA Button -->
        <div style="background:#f0f4f8;border-radius:0 0 16px 16px;padding:24px;text-align:center">
          <a href="${escapeHtml(rescheduleLink)}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;font-size:14px">
            Ver Detalhes da Entrevista
          </a>
          <p style="margin:16px 0 0 0;color:#64748b;font-size:12px">
            Não consegue participar? Acesse a plataforma para reagendar.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align:center;padding:24px;font-size:12px;color:#94a3b8">
          <p style="margin:0">
            ${escapeHtml(SITE_NAME)} · <a href="${SITE_URL}" style="color:#a5b4fc;text-decoration:none">${SITE_URL}</a>
          </p>
          <p style="margin:8px 0 0 0">
            Este é um e-mail automático. Não responda este mensagem.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendWhatsAppMessage(params: {
  whatsapp: string;
  candidatoNome: string;
  vagaTitulo: string;
  empresaNome: string;
  tipo: "presencial" | "online";
  dataSugerida: Date;
  linkVideo?: string | null;
}): Promise<boolean> {
  const { whatsapp, candidatoNome, vagaTitulo, tipo, dataSugerida, linkVideo } = params;
  const tipoLabel = tipo === "online" ? "online" : "presencial";
  const dataBR = formatDataBR(dataSugerida);

  // Format WhatsApp message (simple text format)
  let message = `Oi ${candidatoNome}! 🎉\n\nVocê foi chamado para uma entrevista sobre a vaga "${vagaTitulo}".\n\n`;
  message += `📅 Data: ${dataBR}\n`;
  message += `📍 Tipo: ${tipoLabel}\n`;

  if (tipo === "online" && linkVideo) {
    message += `🔗 Link: ${linkVideo}\n`;
  }

  message += `\nAcesse a plataforma para confirmar ou reagendar: ${SITE_URL}/candidato/entrevistas\n\nBoa sorte!`;

  // Try to send via WhatsApp API (if configured)
  const whatsappApiKey = process.env.WHATSAPP_API_KEY;
  const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!whatsappApiKey || !whatsappPhoneNumberId) {
    console.warn("[sendWhatsAppMessage] WhatsApp API not configured — skipping WhatsApp send");
    return false;
  }

  try {
    // Format phone: remove non-digits and ensure it has 55 (Brazil country code) prefix
    const phoneNumber = whatsapp.replace(/\D/g, "");
    const formattedPhone = phoneNumber.startsWith("55") ? phoneNumber : `55${phoneNumber}`;

    const res = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
          body: message,
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(`[sendWhatsAppMessage] WhatsApp API error ${res.status}: ${errorText}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[sendWhatsAppMessage] Error sending WhatsApp message:", err);
    return false;
  }
}

/**
 * Empresa chama candidato para entrevista.
 * Envia e-mail + WhatsApp (if configured) e cria registro na tabela "entrevistas".
 */
export const chamarPraEntrevista = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ChamarPraEntrevistaInput.parse(input))
  .handler(async ({ data, context }): Promise<ChamarPraEntrevistaResponse> => {
    const { userId } = context;

    try {
      // Fetch candidate data (nome, WhatsApp) — email vive em auth.users, não em profiles
      const { data: candidatoProfile, error: candidatoError } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, whatsapp")
        .eq("id", data.candidato_id)
        .maybeSingle();

      if (candidatoError || !candidatoProfile) {
        return {
          ok: false,
          error: "Candidato não encontrado",
        };
      }

      const { data: candidatoAuth } = await supabaseAdmin.auth.admin.getUserById(data.candidato_id);
      const candidato = { ...candidatoProfile, email: candidatoAuth?.user?.email ?? null };

      // Fetch vaga data (titulo)
      const { data: vaga, error: vagaError } = await supabaseAdmin
        .from("vagas")
        .select("id, titulo, empresa_nome, empresa_id")
        .eq("id", data.vaga_id)
        .maybeSingle();

      if (vagaError || !vaga) {
        return {
          ok: false,
          error: "Vaga não encontrada",
        };
      }

      // Ensure the company making the request owns this vaga
      if (vaga.empresa_id !== userId) {
        return {
          ok: false,
          error: "Você não tem permissão para chamar candidatos para esta vaga",
        };
      }

      // Prepare email content
      const subject = `Você foi chamado para entrevista! [${vaga.titulo}]`;
      const html = generateEmailHtml({
        candidatoNome: candidato.full_name || "Candidato",
        vagaTitulo: vaga.titulo,
        empresaNome: vaga.empresa_nome,
        tipo: data.tipo,
        dataSugerida: data.data_sugerida,
        linkVideo: data.link_video,
        instrucoes: data.instrucoes,
      });

      // Send email
      let emailSent = false;
      if (candidato.email) {
        const emailResult = await sendEmail({
          to: candidato.email,
          subject,
          html,
        });
        emailSent = emailResult.ok;

        if (!emailResult.ok) {
          console.error("[chamarPraEntrevista] Email send failed:", emailResult.err);
        }
      } else {
        console.warn("[chamarPraEntrevista] Candidate has no email");
      }

      // Send WhatsApp
      let whatsappSent = false;
      if (candidato.whatsapp) {
        whatsappSent = await sendWhatsAppMessage({
          whatsapp: candidato.whatsapp,
          candidatoNome: candidato.full_name || "Candidato",
          vagaTitulo: vaga.titulo,
          empresaNome: vaga.empresa_nome,
          tipo: data.tipo,
          dataSugerida: data.data_sugerida,
          linkVideo: data.link_video,
        });
      } else {
        console.warn("[chamarPraEntrevista] Candidate has no WhatsApp");
      }

      // Create entrevista record in database
      const { data: entrevista, error: insertError } = await supabaseAdmin
        .from("entrevistas")
        .insert({
          vaga_id: data.vaga_id,
          candidato_id: data.candidato_id,
          empresa_id: userId,
          tipo: data.tipo,
          data_sugerida: data.data_sugerida.toISOString(),
          link_video: data.link_video ?? null,
          instrucoes: data.instrucoes ?? null,
          email_enviado: emailSent,
          whatsapp_enviado: whatsappSent,
          status: "convite_enviado",
        })
        .select("id")
        .maybeSingle();

      if (insertError || !entrevista) {
        console.error("[chamarPraEntrevista] Database insert failed:", insertError);
        return {
          ok: false,
          error: "Erro ao salvar registro de entrevista",
        };
      }

      return {
        ok: true,
        entrevista_id: entrevista.id,
        email_sent: emailSent,
        whatsapp_sent: whatsappSent,
      };
    } catch (err) {
      console.error("[chamarPraEntrevista] Unexpected error:", err);
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Erro ao chamar para entrevista",
      };
    }
  });

// ═══════════════════════════════════════════════════════════════
// LISTAR ENTREVISTAS
// Candidate or company can list their interviews
// ═══════════════════════════════════════════════════════════════

export const listarMinhasEntrevistas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data, error } = await supabaseAdmin
      .from("entrevistas")
      .select(
        `
        id,
        tipo,
        data_sugerida,
        data_confirmada,
        link_video,
        instrucoes,
        status,
        email_enviado,
        whatsapp_enviado,
        created_at,
        vaga:vaga_id (
          id,
          titulo,
          empresa_nome,
          empresa_id,
          profissao,
          bairro,
          cidade,
          salario
        ),
        candidato:candidato_id (
          id,
          full_name,
          email,
          whatsapp
        )
      `,
      )
      .or(`candidato_id.eq.${userId},empresa_id.eq.${userId}`)
      .order("data_sugerida", { ascending: false });

    if (error) {
      console.error("[listarMinhasEntrevistas] Error:", error);
      return [];
    }

    return data ?? [];
  });

// ═══════════════════════════════════════════════════════════════
// UPDATE STATUS DA ENTREVISTA
// Candidate can update status (aceita, recusada, reagendada, completada)
// ═══════════════════════════════════════════════════════════════

const AtualizarStatusEntrevistaInput = z.object({
  entrevista_id: z.string().uuid("ID da entrevista inválido"),
  status: z.enum(["aceita", "recusada", "reagendada", "completada"], {
    errorMap: () => ({ message: "Status inválido" }),
  }),
  data_confirmada: z
    .string()
    .datetime()
    .optional()
    .transform((s) => (s ? new Date(s) : undefined)),
});

type AtualizarStatusEntrevistaInput = z.infer<typeof AtualizarStatusEntrevistaInput>;

export const atualizarStatusEntrevista = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => AtualizarStatusEntrevistaInput.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Check ownership (only candidato can update)
    const { data: entrevista, error: fetchError } = await supabaseAdmin
      .from("entrevistas")
      .select("id, candidato_id")
      .eq("id", data.entrevista_id)
      .maybeSingle();

    if (fetchError || !entrevista) {
      return { ok: false, error: "Entrevista não encontrada" };
    }

    if (entrevista.candidato_id !== userId) {
      return { ok: false, error: "Você não tem permissão para atualizar esta entrevista" };
    }

    // Update the record
    const { error: updateError } = await supabaseAdmin
      .from("entrevistas")
      .update({
        status: data.status,
        data_confirmada: data.data_confirmada?.toISOString() ?? null,
      })
      .eq("id", data.entrevista_id);

    if (updateError) {
      console.error("[atualizarStatusEntrevista] Error:", updateError);
      return { ok: false, error: "Erro ao atualizar entrevista" };
    }

    return { ok: true };
  });
