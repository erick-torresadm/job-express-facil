
CREATE TABLE public.curriculos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  user_id uuid,
  nome text NOT NULL,
  email text,
  whatsapp text,
  profissao text NOT NULL,
  bairro text,
  cidade text,
  resumo text NOT NULL,
  experiencias jsonb NOT NULL DEFAULT '[]'::jsonb,
  habilidades jsonb NOT NULL DEFAULT '[]'::jsonb,
  dicas jsonb NOT NULL DEFAULT '[]'::jsonb,
  tem_audio boolean NOT NULL DEFAULT false,
  tem_video boolean NOT NULL DEFAULT false,
  duracao_segundos integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_curriculos_slug ON public.curriculos(slug);
CREATE INDEX idx_curriculos_user_id ON public.curriculos(user_id);

ALTER TABLE public.curriculos ENABLE ROW LEVEL SECURITY;

-- Public can read by slug (shareable link). Sensitive fields (email/whatsapp) excluded by select column in app code if needed.
CREATE POLICY "curriculos_public_select" ON public.curriculos
  FOR SELECT USING (true);

CREATE POLICY "curriculos_anon_insert" ON public.curriculos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "curriculos_owner_update" ON public.curriculos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER curriculos_touch
  BEFORE UPDATE ON public.curriculos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
