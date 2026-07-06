import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  path: z.string().min(1).max(500),
  session_id: z.string().min(6).max(80),
  referrer: z.string().max(500).optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
});

function hostOf(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.hostname.toLowerCase();
  } catch {
    return null;
  }
}

function deviceOf(ua: string) {
  const s = ua.toLowerCase();
  if (/(iphone|ipod|android.*mobile|windows phone)/.test(s)) return "mobile";
  if (/(ipad|tablet)/.test(s)) return "tablet";
  return "desktop";
}

function isBotUA(ua: string) {
  return /(bot|crawler|spider|preview|monitor|slack|whatsapp|telegram|facebookexternalhit|discordbot|headless|lighthouse|pingdom|uptimerobot|googlebot|bingbot|yandex|duckduck|applebot|gptbot|oai-searchbot|perplexity|claude|anthropic)/i.test(
    ua,
  );
}

export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return new Response("bad json", { status: 400 });
        }
        const parsed = Body.safeParse(raw);
        if (!parsed.success) return new Response("bad body", { status: 400 });

        const ua = request.headers.get("user-agent") ?? "";
        const country =
          request.headers.get("cf-ipcountry") ??
          request.headers.get("x-vercel-ip-country") ??
          null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("page_views").insert({
          session_id: parsed.data.session_id,
          path: parsed.data.path.slice(0, 500),
          referrer: parsed.data.referrer ?? null,
          referrer_host: hostOf(parsed.data.referrer),
          country,
          ua_device: deviceOf(ua),
          is_bot: isBotUA(ua),
          user_id: parsed.data.user_id ?? null,
        });

        return new Response(null, { status: 204 });
      },
    },
  },
});
