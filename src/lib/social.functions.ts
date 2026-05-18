import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const HandleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Mínimo 3 caracteres")
  .max(30, "Máximo 30 caracteres")
  .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e _");

export type PerfilSocial = {
  id: string;
  handle: string | null;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio_social: string | null;
  role: "candidato" | "empresa" | "admin" | null;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  is_me: boolean;
};

async function buildPerfil(profileId: string, viewerId: string | null): Promise<PerfilSocial | null> {
  const { data: p } = await supabaseAdmin
    .from("profiles")
    .select("id, handle, full_name, company_name, avatar_url, cover_url, bio_social")
    .eq("id", profileId)
    .maybeSingle();
  if (!p) return null;
  const { data: role } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", profileId)
    .maybeSingle();
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabaseAdmin.from("follows").select("id", { count: "exact", head: true }).eq("following_id", profileId),
    supabaseAdmin.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", profileId),
  ]);
  let isFollowing = false;
  if (viewerId && viewerId !== profileId) {
    const { data: f } = await supabaseAdmin
      .from("follows")
      .select("id")
      .eq("follower_id", viewerId)
      .eq("following_id", profileId)
      .maybeSingle();
    isFollowing = !!f;
  }
  return {
    id: p.id,
    handle: p.handle,
    full_name: p.full_name,
    company_name: p.company_name,
    avatar_url: p.avatar_url,
    cover_url: p.cover_url,
    bio_social: p.bio_social,
    role: (role?.role as PerfilSocial["role"]) ?? null,
    followers_count: followers ?? 0,
    following_count: following ?? 0,
    is_following: isFollowing,
    is_me: viewerId === profileId,
  };
}

// Perfil público por handle (qualquer um vê)
export const getPerfilByHandle = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ handle: HandleSchema, viewerId: z.string().uuid().nullable().optional() }).parse(input))
  .handler(async ({ data }) => {
    const { data: p } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("handle", data.handle)
      .maybeSingle();
    if (!p) return null;
    return buildPerfil(p.id, data.viewerId ?? null);
  });

// Meu perfil (autenticado)
export const getMeuPerfil = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return buildPerfil(context.userId, context.userId);
  });

// Atualiza handle / bio / avatar_url / cover_url
export const updateMeuPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      handle: HandleSchema.optional().nullable(),
      bio_social: z.string().trim().max(500).optional().nullable(),
      avatar_url: z.string().url().max(500).optional().nullable(),
      cover_url: z.string().url().max(500).optional().nullable(),
      full_name: z.string().trim().min(1).max(120).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: {
      handle?: string | null;
      bio_social?: string | null;
      avatar_url?: string | null;
      cover_url?: string | null;
      full_name?: string;
    } = {};
    if (data.handle !== undefined) patch.handle = data.handle;
    if (data.bio_social !== undefined) patch.bio_social = data.bio_social;
    if (data.avatar_url !== undefined) patch.avatar_url = data.avatar_url;
    if (data.cover_url !== undefined) patch.cover_url = data.cover_url;
    if (data.full_name !== undefined) patch.full_name = data.full_name;

    // Verifica unicidade de handle
    if (data.handle) {
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("handle", data.handle)
        .neq("id", context.userId)
        .maybeSingle();
      if (existing) throw new Error("Esse @handle já está em uso.");
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(patch)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Seguir / deixar de seguir
export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ targetId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    if (data.targetId === context.userId) throw new Error("Você não pode seguir a si mesmo.");
    const { data: existing } = await supabaseAdmin
      .from("follows")
      .select("id")
      .eq("follower_id", context.userId)
      .eq("following_id", data.targetId)
      .maybeSingle();
    if (existing) {
      await supabaseAdmin.from("follows").delete().eq("id", existing.id);
      return { following: false };
    }
    const { error } = await supabaseAdmin
      .from("follows")
      .insert({ follower_id: context.userId, following_id: data.targetId });
    if (error) throw new Error(error.message);
    return { following: true };
  });

// Sugere um handle a partir do nome (para o primeiro acesso)
export const sugerirHandle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: p } = await supabaseAdmin
      .from("profiles")
      .select("handle, full_name, company_name")
      .eq("id", context.userId)
      .maybeSingle();
    if (p?.handle) return { handle: p.handle };
    const base = (p?.company_name ?? p?.full_name ?? "user")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 24) || "user";
    for (let i = 0; i < 50; i++) {
      const candidato = i === 0 ? base : `${base}${i}`;
      const { data: hit } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("handle", candidato)
        .maybeSingle();
      if (!hit) return { handle: candidato };
    }
    return { handle: `${base}${Math.floor(Math.random() * 9999)}` };
  });
