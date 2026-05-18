DO $$ BEGIN
  CREATE TYPE public.verificacao_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.verificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  documento_url TEXT NOT NULL,
  comprovante_url TEXT NOT NULL,
  status verificacao_status NOT NULL DEFAULT 'pendente',
  motivo_rejeicao TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS verificacoes_empresa_idx ON public.verificacoes(empresa_id);
CREATE INDEX IF NOT EXISTS verificacoes_status_idx ON public.verificacoes(status);

ALTER TABLE public.verificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS verif_self_select ON public.verificacoes;
CREATE POLICY verif_self_select ON public.verificacoes FOR SELECT TO authenticated
  USING (auth.uid() = empresa_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS verif_self_insert ON public.verificacoes;
CREATE POLICY verif_self_insert ON public.verificacoes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = empresa_id AND public.has_role(auth.uid(), 'empresa'));

DROP POLICY IF EXISTS verif_admin_update ON public.verificacoes;
CREATE POLICY verif_admin_update ON public.verificacoes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS touch_verificacoes ON public.verificacoes;
CREATE TRIGGER touch_verificacoes BEFORE UPDATE ON public.verificacoes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP POLICY IF EXISTS profiles_admin_update ON public.profiles;
CREATE POLICY profiles_admin_update ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS profiles_admin_select ON public.profiles;
CREATE POLICY profiles_admin_select ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO storage.buckets (id, name, public)
VALUES ('verificacao-docs', 'verificacao-docs', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS verif_docs_owner_select ON storage.objects;
CREATE POLICY verif_docs_owner_select ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'verificacao-docs'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
  );

DROP POLICY IF EXISTS verif_docs_owner_insert ON storage.objects;
CREATE POLICY verif_docs_owner_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'verificacao-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );