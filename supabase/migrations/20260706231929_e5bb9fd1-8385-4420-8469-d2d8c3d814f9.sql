
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS digest_opt_out boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.empresa_daily_digest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  sent_day date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  UNIQUE (empresa_id, kind, sent_day)
);

GRANT SELECT ON public.empresa_daily_digest TO authenticated;
GRANT ALL ON public.empresa_daily_digest TO service_role;

ALTER TABLE public.empresa_daily_digest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresa vê seu próprio log de digest"
ON public.empresa_daily_digest FOR SELECT
TO authenticated
USING (auth.uid() = empresa_id);

CREATE INDEX IF NOT EXISTS idx_digest_empresa_day
  ON public.empresa_daily_digest (empresa_id, sent_day);
