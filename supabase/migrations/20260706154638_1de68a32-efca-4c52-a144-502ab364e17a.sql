
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vaga_regime') THEN
    CREATE TYPE public.vaga_regime AS ENUM ('clt', 'pj', 'estagio', 'outros');
  END IF;
END $$;

ALTER TABLE public.vagas
  ADD COLUMN IF NOT EXISTS regime public.vaga_regime NOT NULL DEFAULT 'clt';

-- Backfill heurístico das vagas existentes
UPDATE public.vagas
SET regime = 'estagio'
WHERE regime = 'clt'
  AND (
    lower(titulo) LIKE '%estágio%' OR lower(titulo) LIKE '%estagio%'
    OR lower(titulo) LIKE '%estagiário%' OR lower(titulo) LIKE '%estagiario%'
    OR lower(coalesce(descricao,'')) LIKE '%estágio%'
  );

UPDATE public.vagas
SET regime = 'pj'
WHERE regime = 'clt'
  AND (
    lower(titulo) LIKE '% pj%' OR lower(titulo) LIKE '%(pj)%'
    OR lower(titulo) LIKE '%autônomo%' OR lower(titulo) LIKE '%autonomo%'
    OR lower(titulo) LIKE '%freelancer%' OR lower(titulo) LIKE '%freela%'
    OR lower(titulo) LIKE '%mei%'
  );

CREATE INDEX IF NOT EXISTS vagas_regime_ativa_created_idx
  ON public.vagas (regime, ativa, created_at DESC);
