
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

CREATE TABLE IF NOT EXISTS public.blog_ingest_nonces (
  nonce text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.blog_ingest_nonces TO service_role;
ALTER TABLE public.blog_ingest_nonces ENABLE ROW LEVEL SECURITY;
-- Sem policies: apenas service_role (bypassa RLS) pode acessar.

CREATE INDEX IF NOT EXISTS idx_blog_ingest_nonces_created ON public.blog_ingest_nonces(created_at);
