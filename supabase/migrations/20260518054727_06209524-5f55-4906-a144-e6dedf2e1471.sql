
ALTER TABLE public.curriculos
  ADD COLUMN IF NOT EXISTS disponibilidade text,
  ADD COLUMN IF NOT EXISTS pretensao_salarial text,
  ADD COLUMN IF NOT EXISTS cnh text,
  ADD COLUMN IF NOT EXISTS idiomas jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS endereco text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

ALTER TABLE public.vagas
  ADD COLUMN IF NOT EXISTS endereco text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS perguntas_triagem jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faixa_salarial_sugerida text,
  ADD COLUMN IF NOT EXISTS risco_fraude integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risco_motivo text,
  ADD COLUMN IF NOT EXISTS custo_alimentacao_mes integer,
  ADD COLUMN IF NOT EXISTS slug text;

CREATE INDEX IF NOT EXISTS idx_vagas_slug ON public.vagas(slug);
