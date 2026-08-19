-- ═══════════════════════════════════════════════════════════════
-- ENTREVISTAS TABLE
-- Stores interview invitations sent by companies to candidates.
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE public.entrevista_tipo AS ENUM ('presencial', 'online');
CREATE TYPE public.entrevista_status AS ENUM ('convite_enviado', 'aceita', 'recusada', 'reagendada', 'completada');

CREATE TABLE public.entrevistas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id uuid NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
  candidato_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  tipo public.entrevista_tipo NOT NULL,
  data_sugerida timestamptz NOT NULL,
  data_confirmada timestamptz,

  link_video text,
  instrucoes text,

  email_enviado boolean NOT NULL DEFAULT false,
  whatsapp_enviado boolean NOT NULL DEFAULT false,

  status public.entrevista_status NOT NULL DEFAULT 'convite_enviado',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.entrevistas ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "entrevistas_candidato_select" ON public.entrevistas FOR SELECT TO authenticated
  USING (auth.uid() = candidato_id);
CREATE POLICY "entrevistas_empresa_select" ON public.entrevistas FOR SELECT TO authenticated
  USING (auth.uid() = empresa_id);
CREATE POLICY "entrevistas_empresa_insert" ON public.entrevistas FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = empresa_id AND public.has_role(auth.uid(), 'empresa'));
CREATE POLICY "entrevistas_empresa_update" ON public.entrevistas FOR UPDATE TO authenticated
  USING (auth.uid() = empresa_id);

CREATE INDEX idx_entrevistas_candidato ON public.entrevistas(candidato_id);
CREATE INDEX idx_entrevistas_empresa ON public.entrevistas(empresa_id);
CREATE INDEX idx_entrevistas_vaga ON public.entrevistas(vaga_id);
CREATE INDEX idx_entrevistas_status_created ON public.entrevistas(status, created_at DESC);

-- updated_at trigger
CREATE TRIGGER entrevistas_touch BEFORE UPDATE ON public.entrevistas
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.entrevistas;

-- Notify candidate when an interview invitation is sent
CREATE OR REPLACE FUNCTION public.notify_entrevista_convite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vaga_titulo text;
  v_empresa_nome text;
BEGIN
  SELECT titulo, empresa_nome INTO v_vaga_titulo, v_empresa_nome
  FROM public.vagas WHERE id = NEW.vaga_id;

  INSERT INTO public.notificacoes (user_id, titulo, mensagem, link)
  VALUES (
    NEW.candidato_id,
    'Chamado para entrevista: ' || COALESCE(v_vaga_titulo, 'Nova oportunidade'),
    v_empresa_nome || COALESCE(' • ' || (CASE WHEN NEW.tipo = 'online' THEN 'Online' ELSE 'Presencial' END), ''),
    '/candidato/entrevistas'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_entrevista_convite ON public.entrevistas;
CREATE TRIGGER trg_notify_entrevista_convite
AFTER INSERT ON public.entrevistas
FOR EACH ROW EXECUTE FUNCTION public.notify_entrevista_convite();
