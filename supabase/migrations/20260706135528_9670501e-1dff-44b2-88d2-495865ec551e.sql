
CREATE TABLE IF NOT EXISTS public.page_views (
  id           bigserial PRIMARY KEY,
  session_id   text NOT NULL,
  path         text NOT NULL,
  referrer     text,
  referrer_host text,
  country      text,
  ua_device    text,
  is_bot       boolean NOT NULL DEFAULT false,
  user_id      uuid,
  created_at   timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.page_views TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.page_views_id_seq TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
-- Sem policies: apenas service_role acessa (via server functions).

CREATE INDEX IF NOT EXISTS idx_page_views_created ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON public.page_views(session_id, created_at);
