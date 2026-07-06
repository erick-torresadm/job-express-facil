// Cron diário: envia resumo (email + push) para todas as empresas cadastradas
// que não fizeram opt-out. Roda 1x/dia via pg_cron chamando com header x-cron-secret.
import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL, SITE_NAME } from "@/lib/site";

type ProfileRow = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  digest_opt_out: boolean | null;
  promo_pro_ate: string | null;
};

async function getEmailForUser(userId: string): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  return data?.user?.email ?? null;
}

async function sendResend(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, err: "RESEND_API_KEY ausente" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${SITE_NAME} <no-reply@vagasagora.com.br>`,
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) return { ok: false, err: `resend ${res.status}: ${await res.text()}` };
  return { ok: true as const };
}

function renderHtml(opts: {
  nomeEmpresa: string;
  candidatos24h: number;
  vagasAtivas: number;
  ultimaVagaDias: number | null;
  topCurriculos: Array<{ nome: string; profissao: string; cidade: string | null; slug: string }>;
  proAte: string | null;
}) {
  const proBadge = opts.proAte
    ? `<p style="background:#f5f1ff;border:1px solid #e0d4ff;color:#5a2ea3;padding:10px 14px;border-radius:12px;font-size:13px;margin:0 0 16px 0;"><strong>🎁 Plano Pro ativo</strong> até ${new Date(opts.proAte).toLocaleDateString("pt-BR")} — todos os recursos liberados.</p>`
    : "";
  const alerta = opts.ultimaVagaDias !== null && opts.ultimaVagaDias >= 7
    ? `<p style="background:#fff4e5;border:1px solid #ffd799;color:#8a4b00;padding:10px 14px;border-radius:12px;font-size:13px;margin:0 0 16px 0;">⚠️ Sua última vaga foi publicada há <strong>${opts.ultimaVagaDias} dias</strong>. <a href="${SITE_URL}/empresa/nova-vaga" style="color:#8a4b00;font-weight:700;">Publique uma nova →</a></p>`
    : "";
  const listaCvs = opts.topCurriculos.length === 0
    ? `<p style="color:#666;font-size:13px;margin:8px 0;">Nenhum currículo novo hoje — mas estamos rastreando pra você.</p>`
    : `<ul style="list-style:none;padding:0;margin:8px 0 16px 0;">${opts.topCurriculos.map((c) => `<li style="padding:10px 12px;border:1px solid #eee;border-radius:10px;margin:6px 0;"><strong>${c.nome}</strong> — ${c.profissao}${c.cidade ? ` · ${c.cidade}` : ""}<br/><a href="${SITE_URL}/cv/${c.slug}" style="color:#1a56db;font-size:12px;font-weight:700;">Ver perfil →</a></li>`).join("")}</ul>`;

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <h1 style="font-size:22px;margin:0 0 4px 0;">${SITE_NAME}</h1>
    <p style="color:#666;font-size:13px;margin:0 0 20px 0;">Resumo diário de ${new Date().toLocaleDateString("pt-BR")}</p>

    ${proBadge}
    ${alerta}

    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px;margin:0 0 16px 0;">
      <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Olá, ${opts.nomeEmpresa}</p>
      <h2 style="margin:6px 0 12px 0;font-size:20px;">Você tem <span style="color:#1a56db;">${opts.candidatos24h}</span> candidato${opts.candidatos24h === 1 ? "" : "s"} novo${opts.candidatos24h === 1 ? "" : "s"} hoje</h2>
      <p style="margin:0 0 4px 0;font-size:14px;color:#333;"><strong>${opts.vagasAtivas}</strong> vaga${opts.vagasAtivas === 1 ? "" : "s"} ativa${opts.vagasAtivas === 1 ? "" : "s"} no ar</p>
    </div>

    <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#666;margin:20px 0 6px 0;">Currículos novos pra você</h3>
    ${listaCvs}

    <div style="text-align:center;margin:20px 0;">
      <a href="${SITE_URL}/empresa" style="display:inline-block;background:#1a56db;color:#fff;padding:12px 28px;border-radius:12px;font-weight:700;text-decoration:none;">Abrir painel</a>
    </div>

    <p style="color:#999;font-size:11px;text-align:center;margin:24px 0 0 0;">
      Você recebe este email porque tem conta de empresa no ${SITE_NAME}.<br/>
      <a href="${SITE_URL}/empresa" style="color:#999;">Desativar no painel →</a>
    </p>
  </div>
</body></html>`;
}

export const Route = createFileRoute("/api/public/cron/empresa-daily")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Aceita duas formas de autorização:
        // 1) header x-cron-secret == CRON_SECRET (para chamadas manuais)
        // 2) header apikey == SUPABASE anon/publishable key (padrão pg_cron via pg_net)
        const cronSecret = request.headers.get("x-cron-secret");
        const apiKey = request.headers.get("apikey");
        const okSecret = cronSecret && cronSecret === process.env.CRON_SECRET;
        const okApiKey = apiKey && apiKey === process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!okSecret && !okApiKey) {
          return new Response("Unauthorized", { status: 401 });
        }


        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const hoje = new Date().toISOString().slice(0, 10);

        // Pega ids de empresas
        const { data: roles } = await supabaseAdmin
          .from("user_roles")
          .select("user_id")
          .eq("role", "empresa");
        const empresaIds = (roles ?? []).map((r) => r.user_id);
        if (empresaIds.length === 0) {
          return Response.json({ ok: true, empresas: 0, enviados: 0 });
        }

        // Profiles + opt-out
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, company_name, digest_opt_out, promo_pro_ate")
          .in("id", empresaIds);
        const profileMap = new Map<string, ProfileRow>(
          ((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p]),
        );

        // Já enviados hoje
        const { data: enviadosHoje } = await supabaseAdmin
          .from("empresa_daily_digest")
          .select("empresa_id")
          .eq("kind", "email")
          .eq("sent_day", hoje);
        const jaEnviados = new Set((enviadosHoje ?? []).map((r) => r.empresa_id));

        let enviados = 0;
        let pulados = 0;
        let falhas = 0;

        for (const empresaId of empresaIds) {
          const prof = profileMap.get(empresaId);
          if (!prof || prof.digest_opt_out) { pulados++; continue; }
          if (jaEnviados.has(empresaId)) { pulados++; continue; }

          // Métricas
          const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const [{ count: candidatos24h }, { count: vagasAtivas }, { data: ultima }, { data: cvs }] = await Promise.all([
            supabaseAdmin.from("candidaturas")
              .select("id", { count: "exact", head: true })
              .gte("created_at", desde)
              .in("vaga_id", (
                await supabaseAdmin.from("vagas").select("id").eq("empresa_id", empresaId)
              ).data?.map((v) => v.id) ?? []),
            supabaseAdmin.from("vagas")
              .select("id", { count: "exact", head: true })
              .eq("empresa_id", empresaId).eq("ativa", true),
            supabaseAdmin.from("vagas")
              .select("created_at").eq("empresa_id", empresaId)
              .order("created_at", { ascending: false }).limit(1).maybeSingle(),
            supabaseAdmin.from("curriculos")
              .select("nome, profissao, cidade, slug")
              .gte("created_at", desde)
              .not("slug", "is", null)
              .order("created_at", { ascending: false })
              .limit(3),
          ]);

          const ultimaVagaDias = (ultima as { created_at?: string } | null)?.created_at
            ? Math.floor((Date.now() - new Date((ultima as { created_at: string }).created_at).getTime()) / 86400000)
            : null;

          const email = await getEmailForUser(empresaId);
          if (!email) { falhas++; continue; }

          const html = renderHtml({
            nomeEmpresa: prof.company_name || prof.full_name || "empresa",
            candidatos24h: candidatos24h ?? 0,
            vagasAtivas: vagasAtivas ?? 0,
            ultimaVagaDias,
            topCurriculos: (cvs ?? []) as Array<{ nome: string; profissao: string; cidade: string | null; slug: string }>,
            proAte: prof.promo_pro_ate,
          });

          const subject = `📊 ${candidatos24h ?? 0} novos candidatos hoje · ${SITE_NAME}`;
          const r = await sendResend(email, subject, html);
          if (r.ok) {
            enviados++;
            await supabaseAdmin.from("empresa_daily_digest").insert({
              empresa_id: empresaId, kind: "email", sent_day: hoje,
            });
          } else {
            falhas++;
          }

          // Push (fire and forget)
          try {
            const { data: subs } = await supabaseAdmin
              .from("push_subscriptions")
              .select("endpoint, p256dh, auth")
              .eq("user_id", empresaId);
            if (subs && subs.length > 0) {
              const { sendPushBatch } = await import("@/lib/push.server");
              await sendPushBatch(subs, {
                title: `${candidatos24h ?? 0} novos candidatos hoje`,
                body: `${vagasAtivas ?? 0} vaga(s) ativa(s). Toque pra abrir o painel.`,
                url: "/empresa",
                tag: "digest-diario",
              });
              await supabaseAdmin.from("empresa_daily_digest").insert({
                empresa_id: empresaId, kind: "push", sent_day: hoje,
              }).select().maybeSingle();
            }
          } catch (err) {
            console.error("[digest push]", err);
          }
        }

        return Response.json({ ok: true, empresas: empresaIds.length, enviados, pulados, falhas });
      },
    },
  },
});
