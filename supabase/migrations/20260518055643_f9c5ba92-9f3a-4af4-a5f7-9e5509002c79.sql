
-- Página pública personalizada da empresa
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS slug_publico text UNIQUE,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS cor_primaria text,
  ADD COLUMN IF NOT EXISTS sobre text,
  ADD COLUMN IF NOT EXISTS campos_extras jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Permitir leitura pública dos dados de marca (somente colunas seguras via server fn)
CREATE POLICY "profiles_public_branding_select"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (slug_publico IS NOT NULL);

-- Currículos: marcar origem quando vem do link personalizado da empresa
ALTER TABLE public.curriculos
  ADD COLUMN IF NOT EXISTS empresa_origem_id uuid;

CREATE INDEX IF NOT EXISTS idx_curriculos_empresa_origem ON public.curriculos(empresa_origem_id);

-- Revelações: cada contato liberado por uma empresa
CREATE TABLE IF NOT EXISTS public.revelacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  curriculo_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (empresa_id, curriculo_id)
);

CREATE INDEX IF NOT EXISTS idx_revelacoes_empresa ON public.revelacoes(empresa_id);

ALTER TABLE public.revelacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revelacoes_self_select"
  ON public.revelacoes FOR SELECT TO authenticated
  USING (auth.uid() = empresa_id);

CREATE POLICY "revelacoes_self_insert"
  ON public.revelacoes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = empresa_id AND has_role(auth.uid(), 'empresa'));
