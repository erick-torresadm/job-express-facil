// Server functions públicas para disparar notificação push aos admins
// em ações-chave (nova vaga, nova candidatura). Sem auth porque são
// chamadas fire-and-forget do cliente e apenas notificam admins (não
// expõem dados sensíveis).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit.server";

export const notifyAdminsVagaCriada = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        titulo: z.string().trim().min(1).max(200),
        empresa: z.string().trim().max(200).optional().nullable(),
        cidade: z.string().trim().max(120).optional().nullable(),
        slug: z.string().trim().max(200).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    rateLimit(`notify-vaga:${data.titulo.toLowerCase()}`, 10, 60_000);
    const { notifyAdminsPush } = await import("@/lib/admin-push.server");
    await notifyAdminsPush({
      title: "Nova VAGA publicada",
      body: `${data.titulo}${data.empresa ? " · " + data.empresa : ""}${data.cidade ? " · " + data.cidade : ""}`,
      url: data.slug ? `/vagas/${data.slug}` : "/admin/vagas",
      tag: `vaga-nova`,
    });
    return { ok: true as const };
  });

export const notifyAdminsCandidatura = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        vagaTitulo: z.string().trim().min(1).max(200),
        candidato: z.string().trim().max(200).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    rateLimit(`notify-cand:${data.vagaTitulo.toLowerCase()}`, 20, 60_000);
    const { notifyAdminsPush } = await import("@/lib/admin-push.server");
    await notifyAdminsPush({
      title: "Nova CANDIDATURA",
      body: `${data.candidato ?? "Candidato"} → ${data.vagaTitulo}`,
      url: "/admin",
      tag: "candidatura-nova",
    });
    return { ok: true as const };
  });
