import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rateLimit } from "@/lib/rate-limit.server";

// Versão pública do currículo: SEM email, WhatsApp ou endereço.
// Empresa só vê contato após pagar "revelar contato".
export const getCurriculoPublico = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().trim().min(1).max(100) }).parse(input))
  .handler(async ({ data }) => {
    const { data: cv } = await supabaseAdmin
      .from("curriculos")
      .select("slug, nome, profissao, bairro, cidade, resumo, experiencias, habilidades, dicas, idiomas, cnh, disponibilidade, pretensao_salarial, tem_audio, tem_video, duracao_segundos, linkedin_url, created_at")
      .eq("slug", data.slug)
      .maybeSingle();
    return cv ?? null;
  });

// Claim seguro: só currículos sem dono criados há menos de 30 min.
export const claimCurriculo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ slug: z.string().trim().min(1).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    rateLimit(`claim-cv:${userId}`, 10, 60_000);
    const { data: cv } = await supabaseAdmin
      .from("curriculos")
      .select("id, user_id, created_at")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!cv) throw new Error("Currículo não encontrado.");
    if (cv.user_id) {
      if (cv.user_id === userId) return { ok: true };
      throw new Error("Este currículo já tem dono.");
    }
    const ageMs = Date.now() - new Date(cv.created_at).getTime();
    if (ageMs > 30 * 60 * 1000) throw new Error("Janela de claim expirou (30 min).");
    const { error } = await supabaseAdmin
      .from("curriculos")
      .update({ user_id: userId })
      .eq("id", cv.id)
      .is("user_id", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Atualiza apenas o URL do LinkedIn no currículo do próprio usuário.
export const updateLinkedin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      slug: z.string().trim().min(1).max(100),
      linkedinUrl: z
        .string()
        .trim()
        .max(255)
        .regex(/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i, "URL precisa ser do LinkedIn")
        .or(z.literal(""))
        .transform((v) => (v === "" ? null : v))
        .nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: cv } = await supabaseAdmin
      .from("curriculos")
      .select("id, user_id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!cv) throw new Error("Currículo não encontrado.");
    if (cv.user_id !== userId) throw new Error("Você não é o dono deste currículo.");
    const { error } = await supabaseAdmin
      .from("curriculos")
      .update({ linkedin_url: data.linkedinUrl })
      .eq("id", cv.id);
    if (error) throw new Error(error.message);
    return { ok: true, linkedinUrl: data.linkedinUrl };
  });
