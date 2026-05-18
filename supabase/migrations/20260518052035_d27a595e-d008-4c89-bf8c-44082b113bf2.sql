
-- VAGAS
CREATE TABLE public.vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  empresa_nome TEXT NOT NULL,
  salario TEXT NOT NULL,
  horario TEXT NOT NULL,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL DEFAULT 'São Paulo',
  profissao TEXT NOT NULL,
  profissao_slug TEXT NOT NULL,
  descricao TEXT,
  requisitos JSONB NOT NULL DEFAULT '[]'::jsonb,
  urgente BOOLEAN NOT NULL DEFAULT false,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vagas_public_select" ON public.vagas FOR SELECT USING (ativa = true OR auth.uid() = empresa_id);
CREATE POLICY "vagas_empresa_insert" ON public.vagas FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = empresa_id AND public.has_role(auth.uid(), 'empresa'));
CREATE POLICY "vagas_empresa_update" ON public.vagas FOR UPDATE TO authenticated
  USING (auth.uid() = empresa_id);
CREATE POLICY "vagas_empresa_delete" ON public.vagas FOR DELETE TO authenticated
  USING (auth.uid() = empresa_id);

CREATE TRIGGER vagas_touch BEFORE UPDATE ON public.vagas
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_vagas_ativa_created ON public.vagas (ativa, created_at DESC);
CREATE INDEX idx_vagas_profissao_slug ON public.vagas (profissao_slug);
CREATE INDEX idx_vagas_cidade ON public.vagas (cidade);
CREATE INDEX idx_vagas_empresa ON public.vagas (empresa_id);

-- NOTIFICACOES
CREATE TABLE public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  link TEXT,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_self_select" ON public.notificacoes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "notif_self_update" ON public.notificacoes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "notif_self_delete" ON public.notificacoes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "notif_authenticated_insert" ON public.notificacoes FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_notif_user_created ON public.notificacoes (user_id, created_at DESC);
CREATE INDEX idx_notif_user_lida ON public.notificacoes (user_id, lida);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vagas;

-- Notificar candidatos quando empresa publicar vaga
CREATE OR REPLACE FUNCTION public.notify_candidatos_nova_vaga()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ativa = true THEN
    INSERT INTO public.notificacoes (user_id, titulo, mensagem, link)
    SELECT ur.user_id,
           'Nova vaga: ' || NEW.titulo,
           NEW.empresa_nome || ' • ' || NEW.bairro || ' • ' || NEW.salario,
           '/vagas/' || NEW.profissao_slug || '-em-' || lower(replace(NEW.cidade, ' ', '-'))
    FROM public.user_roles ur
    WHERE ur.role = 'candidato';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_candidatos_nova_vaga
AFTER INSERT ON public.vagas
FOR EACH ROW EXECUTE FUNCTION public.notify_candidatos_nova_vaga();

-- Notificar empresas quando um novo currículo for criado por usuário autenticado
CREATE OR REPLACE FUNCTION public.notify_empresas_novo_curriculo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notificacoes (user_id, titulo, mensagem, link)
    SELECT ur.user_id,
           'Novo candidato: ' || NEW.nome,
           NEW.profissao || COALESCE(' • ' || NEW.bairro, ''),
           '/empresa'
    FROM public.user_roles ur
    WHERE ur.role = 'empresa';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_empresas_novo_curriculo
AFTER INSERT ON public.curriculos
FOR EACH ROW EXECUTE FUNCTION public.notify_empresas_novo_curriculo();
