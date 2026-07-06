import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SITE_URL } from "./site";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ─────────────────────────────────────────────────────────────
// Google Indexing API — pings for JobPosting URLs
// Docs: https://developers.google.com/search/apis/indexing-api/v3/using-api
// ─────────────────────────────────────────────────────────────

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

function b64url(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") bytes = new TextEncoder().encode(input);
  else if (input instanceof Uint8Array) bytes = input;
  else bytes = new Uint8Array(input);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

export async function getAccessToken(): Promise<string> {
  const raw = process.env.GOOGLE_INDEXING_SA_JSON;
  if (!raw) throw new Error("GOOGLE_INDEXING_SA_JSON não configurado");
  const sa: ServiceAccount = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: sa.token_uri || "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const toSign = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key.replace(/\\n/g, "\n")),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(toSign));
  const jwt = `${toSign}.${b64url(sig)}`;

  const res = await fetch(sa.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`OAuth token falhou [${res.status}]: ${await res.text()}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function publish(url: string, type: "URL_UPDATED" | "URL_DELETED", token: string) {
  const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, type }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Indexing publish falhou [${res.status}]: ${body}`);
  return body;
}

export const pingIndexingApi = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        url: z.string().url(),
        type: z.enum(["URL_UPDATED", "URL_DELETED"]).default("URL_UPDATED"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const token = await getAccessToken();
      const result = await publish(data.url, data.type, token);
      return { ok: true as const, result };
    } catch (err) {
      console.error("[pingIndexingApi]", err);
      return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
    }
  });

export const pingVagaSlug = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        slug: z.string().min(1),
        type: z.enum(["URL_UPDATED", "URL_DELETED"]).default("URL_UPDATED"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const url = `${SITE_URL}/vagas/${data.slug}`;
    try {
      const token = await getAccessToken();
      const result = await publish(url, data.type, token);
      return { ok: true as const, url, result };
    } catch (err) {
      console.error("[pingVagaSlug]", err);
      return { ok: false as const, url, error: err instanceof Error ? err.message : String(err) };
    }
  });

// ─────────────────────────────────────────────────────────────
// Reindexar todas as vagas ativas (somente admin)
// Google Indexing API quota padrão: 200 URLs/dia para JobPosting.
// Rodamos em lotes pequenos com pausa entre pings pra não estourar rate limit.
// ─────────────────────────────────────────────────────────────
export const reindexarTodasVagas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        limite: z.number().int().min(1).max(200).default(180),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    // Verifica admin
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Acesso negado: apenas administradores.");

    // Puxa vagas ativas priorizando: nunca enviadas > mais antigas
    const { data: vagas, error } = await supabaseAdmin
      .from("vagas")
      .select("id,titulo,cidade,profissao_slug,google_indexed_at")
      .eq("ativa", true)
      .order("google_indexed_at", { ascending: true, nullsFirst: true })
      .limit(data.limite);
    if (error) throw new Error(error.message);

    const token = await getAccessToken();
    let ok = 0;
    let falha = 0;
    const erros: string[] = [];
    const enviadasIds: string[] = [];
    for (const v of vagas ?? []) {
      const slug = `${v.profissao_slug ?? v.titulo.toLowerCase().replace(/\s+/g, "-")}-em-${v.cidade.toLowerCase().replace(/\s+/g, "-")}`;
      const url = `${SITE_URL}/vagas/${slug}`;
      try {
        await publish(url, "URL_UPDATED", token);
        ok++;
        enviadasIds.push(v.id);
      } catch (err) {
        falha++;
        const msg = err instanceof Error ? err.message : String(err);
        if (erros.length < 5) erros.push(`${url}: ${msg}`);
        if (msg.includes("429") || msg.includes("quotaExceeded")) break;
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    if (enviadasIds.length > 0) {
      await supabaseAdmin
        .from("vagas")
        .update({ google_indexed_at: new Date().toISOString() })
        .in("id", enviadasIds);
    }

    return { total: vagas?.length ?? 0, ok, falha, erros };
  });
