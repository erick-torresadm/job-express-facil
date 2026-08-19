// Disparado pelo trigger public.notify_candidatura_nova() (pg_net) toda vez
// que uma candidatura é inserida. Envia push + e-mail pros dois lados:
// a empresa dona da vaga e o candidato que se aplicou.
// Autenticado via header x-cron-secret == CRON_SECRET (mesmo esquema das
// outras rotas de cron/webhook internas).
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendEmail } from "@/lib/email.server";
import { notifyUsersPush } from "@/lib/push-notify.server";
import { SITE_URL } from "@/lib/site";

const Body = z.object({ candidatura_id: z.string().uuid() });

async function getEmail(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  return data?.user?.email ?? null;
}

export const Route = createFileRoute("/api/public/hooks/notificar-candidatura")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sent = request.headers.get("x-cron-secret") ?? "";
        if (!sent || sent !== process.env.CRON_SECRET) {
          return new Response("Unauthorized", { status: 401 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return new Response("bad json", { status: 400 });
        }
        const parsed = Body.safeParse(raw);
        if (!parsed.success) return new Response("bad body", { status: 400 });

        const { data: candidatura } = await supabaseAdmin
          .from("candidaturas")
          .select("id, candidato_id, empresa_id, vaga_id, curriculo_id")
          .eq("id", parsed.data.candidatura_id)
          .maybeSingle();
        if (!candidatura) return new Response("not found", { status: 404 });

        const [{ data: vaga }, { data: curriculo }, { data: empresaProfile }] = await Promise.all([
          supabaseAdmin.from("vagas").select("titulo").eq("id", candidatura.vaga_id).maybeSingle(),
          supabaseAdmin
            .from("curriculos")
            .select("nome, profissao")
            .eq("id", candidatura.curriculo_id)
            .maybeSingle(),
          supabaseAdmin
            .from("profiles")
            .select("company_name")
            .eq("id", candidatura.empresa_id)
            .maybeSingle(),
        ]);

        const titulo = vaga?.titulo ?? "sua vaga";
        const nomeCandidato = curriculo?.nome ?? "Um candidato";
        const profissao = curriculo?.profissao ?? "";
        const nomeEmpresa = empresaProfile?.company_name ?? "a empresa";

        const [empresaEmail, candidatoEmail] = await Promise.all([
          getEmail(candidatura.empresa_id),
          getEmail(candidatura.candidato_id),
        ]);

        await Promise.allSettled([
          empresaEmail &&
            sendEmail({
              to: empresaEmail,
              subject: `Nova candidatura: ${titulo}`,
              html: `<p><strong>${escapeHtml(nomeCandidato)}</strong> (${escapeHtml(profissao)}) se candidatou pra <strong>${escapeHtml(titulo)}</strong>.</p><p><a href="${SITE_URL}/empresa/minhas-vagas">Ver candidatura no painel</a></p>`,
            }),
          candidatoEmail &&
            sendEmail({
              to: candidatoEmail,
              subject: `Candidatura enviada: ${titulo}`,
              html: `<p>Sua candidatura pra <strong>${escapeHtml(titulo)}</strong> em <strong>${escapeHtml(nomeEmpresa)}</strong> foi enviada com sucesso.</p><p><a href="${SITE_URL}/candidato/candidaturas">Acompanhar candidaturas</a></p>`,
            }),
          notifyUsersPush([candidatura.empresa_id], {
            title: "Nova candidatura",
            body: `${nomeCandidato} se candidatou pra ${titulo}`,
            url: "/empresa/minhas-vagas",
            tag: "candidatura",
          }),
          notifyUsersPush([candidatura.candidato_id], {
            title: "Candidatura enviada",
            body: `Você se candidatou pra ${titulo} em ${nomeEmpresa}`,
            url: "/candidato/candidaturas",
            tag: "candidatura",
          }),
        ]);

        return new Response(null, { status: 204 });
      },
    },
  },
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
