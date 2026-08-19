// Recruiter activity tracking and notification system
// Tracks vaga views, CV clicks, and candidature applications
// Provides feed and unread count for recruiter dashboard

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ─────────────────────────────────────────────────────────────
// TRACKING FUNCTIONS (insert events into recruiter_events table)
// ─────────────────────────────────────────────────────────────

/**
 * Track that someone viewed a vaga
 * Called when vaga.$slug page loads (on server-side)
 */
export async function trackVagaView(empresaId: string, vagaId: string): Promise<void> {
  try {
    await supabaseAdmin.from("recruiter_events").insert({
      empresa_id: empresaId,
      vaga_id: vagaId,
      tipo: "vaga_view",
      candidato_id: null,
      curriculo_id: null,
    });
  } catch (err) {
    console.error("[trackVagaView] error:", err);
  }
}

/**
 * Wrapper chamável do client (VagaActions etc). NUNCA importe trackVagaView
 * nem supabaseAdmin diretamente em componente client — vazaria a
 * service_role_key no bundle. Busca o empresa_id da vaga no servidor.
 */
export const trackVagaViewFn = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ vaga_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: vaga } = await supabaseAdmin.from("vagas").select("empresa_id").eq("id", data.vaga_id).maybeSingle();
    if (vaga?.empresa_id) await trackVagaView(vaga.empresa_id, data.vaga_id);
    return { ok: true };
  });

/**
 * Track that a recruiter clicked to view a CV
 * Called when "Ver curriculo" button is clicked in empresa.minhas-vagas
 */
export const trackCvClick = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      curriculo_id: z.string().uuid(),
      candidato_id: z.string().uuid(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    try {
      await supabaseAdmin.from("recruiter_events").insert({
        empresa_id: userId,
        vaga_id: null,
        tipo: "cv_click",
        candidato_id: data.candidato_id,
        curriculo_id: data.curriculo_id,
      });
    } catch (err) {
      console.error("[trackCvClick] error:", err);
    }
    return { ok: true };
  });

/**
 * Track that a candidatura was received
 * This is called from the notificar-candidatura webhook
 */
export async function trackCandidatura(
  empresaId: string,
  vagaId: string,
  candidatoId: string,
): Promise<void> {
  try {
    await supabaseAdmin.from("recruiter_events").insert({
      empresa_id: empresaId,
      vaga_id: vagaId,
      tipo: "candidatura_received",
      candidato_id: candidatoId,
      curriculo_id: null,
    });
  } catch (err) {
    console.error("[trackCandidatura] error:", err);
  }
}

// ─────────────────────────────────────────────────────────────
// FEED & STATUS FUNCTIONS (server functions for recruiter panel)
// ─────────────────────────────────────────────────────────────

export type RecruiterEvent = {
  id: string;
  tipo: "vaga_view" | "cv_click" | "candidatura_received";
  timestamp: string;
  lido: boolean;
  vaga?: { titulo: string; slug?: string } | null;
  candidato?: { nome: string } | null;
  curriculo?: { nome: string } | null;
};

/**
 * Get recruiter's activity feed (last 20 events, newest first)
 * Also marks all as read when fetched
 */
export const getRecruiterFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data: events, error } = await supabaseAdmin
      .from("recruiter_events")
      .select(
        `
        id,
        tipo,
        timestamp,
        lido,
        vaga_id,
        candidato_id,
        curriculo_id,
        vagas:vaga_id (titulo, slug),
        profiles:candidato_id (full_name),
        curriculos:curriculo_id (nome)
        `,
      )
      .eq("empresa_id", userId)
      .order("timestamp", { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);

    // Transform to clean format
    const feed: RecruiterEvent[] = (events ?? []).map((e: any) => ({
      id: e.id,
      tipo: e.tipo,
      timestamp: e.timestamp,
      lido: e.lido,
      vaga: e.vagas?.[0] ?? null,
      candidato: e.profiles?.[0]
        ? { nome: e.profiles[0].full_name }
        : null,
      curriculo: e.curriculos?.[0]
        ? { nome: e.curriculos[0].nome }
        : null,
    }));

    // Mark all as read (but don't await — fire and forget for UX)
    const unreadIds = (events ?? [])
      .filter((e: any) => !e.lido)
      .map((e: any) => e.id);
    if (unreadIds.length > 0) {
      void supabaseAdmin
        .from("recruiter_events")
        .update({ lido: true })
        .in("id", unreadIds)
        .then(({ error: markErr }) => {
          if (markErr) console.error("[markEventsRead] error:", markErr);
        });
    }

    return feed;
  });

/**
 * Explicitly mark a single event as read
 */
export const markEventLido = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ event_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { error } = await supabaseAdmin
      .from("recruiter_events")
      .update({ lido: true })
      .eq("id", data.event_id)
      .eq("empresa_id", userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Get count of unread events for real-time badge
 */
export const countUnreadEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { count, error } = await supabaseAdmin
      .from("recruiter_events")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", userId)
      .eq("lido", false);

    if (error) throw new Error(error.message);
    return { unread: count ?? 0 };
  });

/**
 * Get event summary for dashboard (e.g. "15 pessoas viram sua vaga...")
 */
export const getRecruiterEventsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data: events, error } = await supabaseAdmin
      .from("recruiter_events")
      .select("tipo")
      .eq("empresa_id", userId)
      .gte("timestamp", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // last 30 days

    if (error) throw new Error(error.message);

    const summary = {
      vaga_views: 0,
      cv_clicks: 0,
      candidaturas: 0,
    };

    (events ?? []).forEach((e: any) => {
      if (e.tipo === "vaga_view") summary.vaga_views++;
      else if (e.tipo === "cv_click") summary.cv_clicks++;
      else if (e.tipo === "candidatura_received") summary.candidaturas++;
    });

    return summary;
  });
