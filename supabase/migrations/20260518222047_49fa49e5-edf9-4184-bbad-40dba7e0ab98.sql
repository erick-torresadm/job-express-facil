CREATE TABLE public.anuncios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  placement TEXT NOT NULL,
  titulo TEXT,
  imagem_url TEXT,
  link_url TEXT,
  html_custom TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  prioridade INTEGER NOT NULL DEFAULT 0,
  impressoes INTEGER NOT NULL DEFAULT 0,
  cliques INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_anuncios_placement_ativo ON public.anuncios(placement, ativo, prioridade DESC);

ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anuncios_public_select"
ON public.anuncios FOR SELECT
TO public
USING (ativo = true);

CREATE POLICY "anuncios_admin_all"
ON public.anuncios FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER anuncios_touch_updated_at
BEFORE UPDATE ON public.anuncios
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();