ALTER TABLE public.curriculos ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Validação leve: aceita só URLs do LinkedIn ou NULL
ALTER TABLE public.curriculos DROP CONSTRAINT IF EXISTS curriculos_linkedin_url_check;
ALTER TABLE public.curriculos ADD CONSTRAINT curriculos_linkedin_url_check
  CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://([a-z]{2,3}\.)?linkedin\.com/.+');