
ALTER TABLE public.vagas ADD COLUMN IF NOT EXISTS google_indexed_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_vagas_reindex ON public.vagas (ativa, google_indexed_at NULLS FIRST) WHERE ativa = true;
