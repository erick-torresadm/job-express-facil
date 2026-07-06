import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const DOC = {
  endpoint: "/api/public/blog/ingest",
  method: "POST",
  content_type: "application/json",
  auth: {
    bearer: "Authorization: Bearer <BLOG_INGEST_TOKEN>",
    hmac: {
      algo: "HMAC-SHA256",
      secret_env: "BLOG_INGEST_HMAC_SECRET",
      headers: {
        "x-timestamp": "unix seconds (int). Rejeitado se |now - ts| > 300s",
        "x-nonce": "uuid único por request (guardado 24h)",
        "x-signature": "sha256=HEX(HMAC(secret, timestamp + '.' + raw_body))",
      },
    },
  },
  body: {
    posts: [
      {
        title: "string (3..200)",
        slug: "string opcional (a-z0-9-, 3..120). Se ausente é gerado do title.",
        content_md: "string markdown (>=200 chars)",
        meta_description: "string 40..300",
        tags: ["string", "..."],
        status: "published | draft | scheduled",
        publish_at: "ISO8601 opcional. Obrigatório quando status=scheduled.",
        cover_url: "https URL opcional",
        author: "string opcional",
        faq: [{ question: "string", answer: "string" }],
      },
    ],
  },
  response: {
    ok: true,
    count: 1,
    posts: [{ id: "uuid", slug: "string", status: "string", publish_at: "iso|null", admin_url: "string" }],
    errors: [],
  },
  limits: { max_posts_per_request: 20 },
} as const;

const FaqItem = z.object({
  question: z.string().trim().min(3).max(300),
  answer: z.string().trim().min(3).max(2000),
});

const PostInput = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9-]+$/).optional(),
  content_md: z.string().min(200),
  meta_description: z.string().trim().min(40).max(300),
  tags: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  status: z.enum(["published", "draft", "scheduled"]).default("published"),
  publish_at: z.string().datetime().optional(),
  cover_url: z.string().url().optional(),
  author: z.string().trim().min(2).max(80).optional(),
  faq: z.array(FaqItem).max(20).default([]),
});

const Body = z.object({ posts: z.array(PostInput).min(1).max(20) });

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function safeEq(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  if (A.length !== B.length) return false;
  return timingSafeEqual(A, B);
}

function unauthorized(msg: string) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/blog/ingest")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(DOC, null, 2), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        }),

      POST: async ({ request }) => {
        const token = process.env.BLOG_INGEST_TOKEN;
        const hmacSecret = process.env.BLOG_INGEST_HMAC_SECRET;
        if (!token || !hmacSecret) {
          return new Response(
            JSON.stringify({ ok: false, error: "server_misconfigured" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }

        // 1) Bearer
        const auth = request.headers.get("authorization") ?? "";
        const bearer = auth.replace(/^Bearer\s+/i, "").trim();
        if (!bearer || !safeEq(bearer, token)) return unauthorized("invalid_token");

        // 2) HMAC headers
        const ts = request.headers.get("x-timestamp") ?? "";
        const nonce = (request.headers.get("x-nonce") ?? "").trim();
        const sigHeader = request.headers.get("x-signature") ?? "";
        if (!ts || !nonce || !sigHeader) return unauthorized("missing_signature_headers");
        const tsNum = Number(ts);
        if (!Number.isFinite(tsNum)) return unauthorized("invalid_timestamp");
        const nowSec = Math.floor(Date.now() / 1000);
        if (Math.abs(nowSec - tsNum) > 300) return unauthorized("timestamp_out_of_window");
        if (!/^[a-f0-9-]{8,64}$/i.test(nonce)) return unauthorized("invalid_nonce");

        // 3) HMAC compare (over raw body)
        const rawBody = await request.text();
        const expected = createHmac("sha256", hmacSecret)
          .update(`${ts}.${rawBody}`)
          .digest("hex");
        const provided = sigHeader.replace(/^sha256=/i, "").trim();
        if (!safeEq(provided.toLowerCase(), expected.toLowerCase())) {
          return unauthorized("invalid_signature");
        }

        // 4) Body parse
        let parsed: z.infer<typeof Body>;
        try {
          parsed = Body.parse(JSON.parse(rawBody));
        } catch (e) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "invalid_body",
              detail: e instanceof Error ? e.message : String(e),
            }),
            { status: 400, headers: { "content-type": "application/json" } },
          );
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // 5) Nonce replay guard
        {
          const { error } = await supabaseAdmin
            .from("blog_ingest_nonces")
            .insert({ nonce });
          if (error) {
            // duplicate → replay
            return unauthorized("nonce_replay");
          }
          // best-effort GC de nonces antigos (>24h)
          const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          void supabaseAdmin.from("blog_ingest_nonces").delete().lt("created_at", cutoff);
        }

        // 6) Upsert posts
        const created: Array<{
          id: string;
          slug: string;
          status: string;
          publish_at: string | null;
          admin_url: string;
        }> = [];
        const errors: Array<{ index: number; slug?: string; error: string }> = [];

        const origin = new URL(request.url).origin;

        for (let i = 0; i < parsed.posts.length; i++) {
          const p = parsed.posts[i];
          try {
            let slug = p.slug ?? slugify(p.title);
            if (!slug) throw new Error("slug_vazio");

            let publishAt: string;
            let publicado: boolean;
            let scheduledFor: string | null = null;

            if (p.status === "published") {
              publicado = true;
              publishAt = new Date().toISOString();
            } else if (p.status === "draft") {
              publicado = false;
              publishAt = new Date().toISOString();
            } else {
              // scheduled
              if (!p.publish_at) throw new Error("publish_at_obrigatorio_para_scheduled");
              scheduledFor = new Date(p.publish_at).toISOString();
              publicado = false;
              publishAt = scheduledFor;
            }

            // resolve conflito de slug
            const { data: dup } = await supabaseAdmin
              .from("posts")
              .select("id")
              .eq("slug", slug)
              .maybeSingle();
            if (dup) slug = `${slug}-${Date.now().toString(36).slice(-5)}`;

            const { data: ins, error } = await supabaseAdmin
              .from("posts")
              .insert({
                slug,
                titulo: p.title,
                resumo: p.meta_description.slice(0, 300),
                meta_description: p.meta_description,
                conteudo: p.content_md,
                tags: p.tags,
                autor: p.author ?? "Equipe VagasAgora",
                cover_url: p.cover_url ?? null,
                publicado,
                published_at: publishAt,
                scheduled_for: scheduledFor,
                faq: p.faq,
              })
              .select("id,slug")
              .single();

            if (error) throw new Error(error.message);

            created.push({
              id: ins.id,
              slug: ins.slug,
              status: p.status,
              publish_at: p.status === "scheduled" ? scheduledFor : (publicado ? publishAt : null),
              admin_url: `${origin}/admin/blog/${ins.id}`,
            });
          } catch (e) {
            errors.push({
              index: i,
              slug: p.slug,
              error: e instanceof Error ? e.message : String(e),
            });
          }
        }

        return new Response(
          JSON.stringify({ ok: errors.length === 0, count: created.length, posts: created, errors }),
          {
            status: errors.length && !created.length ? 422 : 200,
            headers: { "content-type": "application/json" },
          },
        );
      },
    },
  },
});
