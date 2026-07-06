// Server functions da promoção de lançamento (Pro grátis por 2 anos).
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PROMO_FIM_MS = new Date("2027-01-06T23:59:59-03:00").getTime();

export const ativarPromoPro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (Date.now() > PROMO_FIM_MS) {
      throw new Error("A promoção de lançamento acabou.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ promo_pro_ate: ate })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const, promo_pro_ate: ate };
  });

export const toggleDigestOptOut = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => {
    if (typeof input !== "object" || input === null || typeof (input as { opt_out?: unknown }).opt_out !== "boolean") {
      throw new Error("payload inválido");
    }
    return { opt_out: (input as { opt_out: boolean }).opt_out };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ digest_opt_out: data.opt_out })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
