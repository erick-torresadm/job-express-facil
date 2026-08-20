import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { rateLimit } from "@/lib/rate-limit.server";

/**
 * Save selfie (data URI) to storage and update profile avatar_url
 */
export const salvarSelfie = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      dataUri: z.string().min(1).max(10_000_000), // data:image/...
      whatsapp: z.string().min(8).max(20), // phone validation
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    rateLimit(`salvar-selfie:${userId}`, 10, 60_000);

    try {
      // Convert data URI to blob
      const response = await fetch(data.dataUri);
      const blob = await response.blob();

      if (blob.size > 5 * 1024 * 1024) {
        throw new Error("Imagem muito grande. Máximo 5MB.");
      }

      // Create a filename for the avatar
      const ext = "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from("avatars")
        .upload(path, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/jpeg",
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get the public URL
      const { data: urlData } = supabaseAdmin.storage
        .from("avatars")
        .getPublicUrl(path);

      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) {
        throw new Error("Não foi possível gerar URL da imagem.");
      }

      // Update profile with avatar_url and whatsapp
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          whatsapp: data.whatsapp,
        })
        .eq("id", userId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return { ok: true, avatar_url: publicUrl };
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Erro ao salvar selfie");
    }
  });

/**
 * Update only whatsapp in profile (without avatar)
 */
export const atualizarWhatsapp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      whatsapp: z.string().min(8).max(20),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    rateLimit(`atualizar-whatsapp:${userId}`, 10, 60_000);

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ whatsapp: data.whatsapp })
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
