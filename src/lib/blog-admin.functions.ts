import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Acesso negado");
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

export const listarPostsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("id,slug,titulo,resumo,autor,publicado,tags,cover_url,published_at,updated_at")
      .order("updated_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getPostAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: post, error } = await supabaseAdmin.from("posts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return post;
  });

const PostInput = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().min(3).max(200),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/).optional(),
  resumo: z.string().min(10).max(500),
  conteudo: z.string().min(20),
  autor: z.string().min(2).max(80).default("Equipe VagasAgora"),
  cover_url: z.string().url().nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(10).default([]),
  publicado: z.boolean().default(true),
});

export const salvarPostAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => PostInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const slug = data.slug || slugify(data.titulo);
    const payload = {
      titulo: data.titulo, slug, resumo: data.resumo, conteudo: data.conteudo,
      autor: data.autor, cover_url: data.cover_url ?? null, tags: data.tags,
      publicado: data.publicado,
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("posts").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: ins, error } = await supabaseAdmin.from("posts")
      .insert({ ...payload, published_at: data.publicado ? new Date().toISOString() : new Date().toISOString() })
      .select("id").single();
    if (error) throw new Error(error.message);
    return { id: ins.id };
  });

export const excluirPostAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sugerirResumoIA = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ titulo: z.string().min(3), conteudo: z.string().min(20) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você cria resumos curtos (máx 280 caracteres) em português do Brasil, persuasivos, sem clickbait, para posts de um blog de empregos." },
          { role: "user", content: `Título: ${data.titulo}\n\nConteúdo:\n${data.conteudo.slice(0, 4000)}\n\nResponda apenas com o resumo.` },
        ],
      }),
    });
    if (!res.ok) throw new Error("Falha ao gerar resumo");
    const json = await res.json();
    return { resumo: (json.choices?.[0]?.message?.content ?? "").trim().slice(0, 480) };
  });
