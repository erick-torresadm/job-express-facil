-- Favoritos
CREATE TABLE public.favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  vaga_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, vaga_id)
);
CREATE INDEX idx_favoritos_user ON public.favoritos(user_id);
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favoritos_self_select" ON public.favoritos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "favoritos_self_insert" ON public.favoritos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favoritos_self_delete" ON public.favoritos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Alertas de busca salvos
CREATE TABLE public.alertas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profissao text,
  cidade text,
  bairro text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_alertas_user ON public.alertas(user_id);
CREATE INDEX idx_alertas_lookup ON public.alertas(ativo, profissao, cidade);
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alertas_self_select" ON public.alertas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "alertas_self_insert" ON public.alertas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "alertas_self_update" ON public.alertas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "alertas_self_delete" ON public.alertas FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Candidaturas (com pipeline simples)
CREATE TYPE public.candidatura_status AS ENUM ('enviado', 'visto', 'em_analise', 'finalizado');

CREATE TABLE public.candidaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id uuid NOT NULL,
  candidato_id uuid NOT NULL,
  curriculo_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  status public.candidatura_status NOT NULL DEFAULT 'enviado',
  respostas jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(vaga_id, candidato_id)
);
CREATE INDEX idx_candidaturas_candidato ON public.candidaturas(candidato_id);
CREATE INDEX idx_candidaturas_empresa ON public.candidaturas(empresa_id);
CREATE INDEX idx_candidaturas_vaga ON public.candidaturas(vaga_id);
ALTER TABLE public.candidaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidaturas_candidato_select" ON public.candidaturas FOR SELECT TO authenticated USING (auth.uid() = candidato_id);
CREATE POLICY "candidaturas_empresa_select" ON public.candidaturas FOR SELECT TO authenticated USING (auth.uid() = empresa_id);
CREATE POLICY "candidaturas_candidato_insert" ON public.candidaturas FOR INSERT TO authenticated WITH CHECK (auth.uid() = candidato_id);
CREATE POLICY "candidaturas_empresa_update" ON public.candidaturas FOR UPDATE TO authenticated USING (auth.uid() = empresa_id);
CREATE POLICY "candidaturas_candidato_delete" ON public.candidaturas FOR DELETE TO authenticated USING (auth.uid() = candidato_id);

CREATE TRIGGER candidaturas_touch BEFORE UPDATE ON public.candidaturas
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Selo verificada nas empresas
ALTER TABLE public.profiles ADD COLUMN verificada boolean NOT NULL DEFAULT false;

-- Trigger: ao publicar vaga, notifica quem tem alerta compatível
CREATE OR REPLACE FUNCTION public.notify_alertas_nova_vaga()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ativa = true THEN
    INSERT INTO public.notificacoes (user_id, titulo, mensagem, link)
    SELECT DISTINCT a.user_id,
           '🔔 Vaga nova pro seu alerta',
           NEW.titulo || ' • ' || NEW.empresa_nome || ' • ' || NEW.bairro,
           '/vagas/' || NEW.profissao_slug || '-em-' || lower(replace(NEW.cidade, ' ', '-'))
    FROM public.alertas a
    WHERE a.ativo = true
      AND (a.profissao IS NULL OR lower(a.profissao) = lower(NEW.profissao) OR lower(NEW.titulo) LIKE '%' || lower(a.profissao) || '%')
      AND (a.cidade IS NULL OR lower(a.cidade) = lower(NEW.cidade));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_alertas_nova_vaga ON public.vagas;
CREATE TRIGGER trg_alertas_nova_vaga
  AFTER INSERT ON public.vagas
  FOR EACH ROW EXECUTE FUNCTION public.notify_alertas_nova_vaga();