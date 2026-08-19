-- ═══════════════════════════════════════════════════════════════
-- RECRUITER ACTIVITY TRACKING
-- Tracks vaga views, CV clicks, and candidatures received
-- Used for real-time notifications + activity feed in recruiter panel
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE public.recruiter_event_type AS ENUM ('vaga_view', 'cv_click', 'candidatura_received');

CREATE TABLE public.recruiter_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vaga_id UUID REFERENCES public.vagas(id) ON DELETE SET NULL,
  tipo public.recruiter_event_type NOT NULL,
  candidato_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  curriculo_id UUID REFERENCES public.curriculos(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  lido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recruiter_events ENABLE ROW LEVEL SECURITY;

-- Only the empresa can view their own events
CREATE POLICY "recruiter_events_empresa_select" ON public.recruiter_events
  FOR SELECT TO authenticated
  USING (auth.uid() = empresa_id);

-- Only the empresa can update their own events (mark as read)
CREATE POLICY "recruiter_events_empresa_update" ON public.recruiter_events
  FOR UPDATE TO authenticated
  USING (auth.uid() = empresa_id);

-- Server can insert events (admin access needed for tracking)
-- This is typically called from server functions

-- Indexes for performance
CREATE INDEX idx_recruiter_events_empresa_timestamp ON public.recruiter_events(empresa_id, timestamp DESC);
CREATE INDEX idx_recruiter_events_empresa_lido ON public.recruiter_events(empresa_id, lido);
CREATE INDEX idx_recruiter_events_empresa_vaga ON public.recruiter_events(empresa_id, vaga_id);
CREATE INDEX idx_recruiter_events_tipo ON public.recruiter_events(tipo);

-- Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.recruiter_events;
