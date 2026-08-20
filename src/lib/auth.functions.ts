import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { rateLimit } from "@/lib/rate-limit.server";

// Login passa pelo servidor só pra poder aplicar rate limit (por IP e por
// conta) antes de bater na API de auth do Supabase — chamando
// signInWithPassword direto do client, não tem como limitar tentativas de
// força bruta no nosso lado.
export const loginComRateLimit = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      email: z.string().trim().email().max(200).toLowerCase(),
      password: z.string().min(1).max(200),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    // 10 tentativas / 5min por IP (qualquer conta) + 5 tentativas / 15min
    // por conta específica (mesmo trocando de IP).
    rateLimit("login:ip", 10, 5 * 60_000);
    rateLimit(`login:conta:${data.email}`, 5, 15 * 60_000);

    const { data: authData, error } = await supabaseAdmin.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error || !authData.session) {
      // Mensagem genérica — não revela se o e-mail existe ou se foi a
      // senha que errou (evita enumeração de contas).
      throw new Error("E-mail ou senha inválidos.");
    }
    return {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
    };
  });

// Cadastro também passa pelo servidor só pra aplicar rate limit por IP —
// sem isso dá pra criar contas em massa (e disparar e-mail de confirmação
// em massa) sem custo nenhum.
export const checarRateLimitCadastro = createServerFn({ method: "POST" })
  .handler(async () => {
    rateLimit("cadastro:ip", 8, 15 * 60_000);
    return { ok: true as const };
  });
