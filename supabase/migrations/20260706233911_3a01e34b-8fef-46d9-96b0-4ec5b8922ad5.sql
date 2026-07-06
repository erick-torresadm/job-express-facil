-- 1) FREELANCERS
CREATE TABLE public.freelancers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text NOT NULL UNIQUE CHECK (handle ~ '^[a-z0-9][a-z0-9-]{2,30}$'),
  nome text NOT NULL,
  headline text,
  bio text,
  avatar_url text,
  cover_url text,
  categoria_principal text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  cidade text,
  estado text,
  atende_remoto boolean NOT NULL DEFAULT true,
  nivel text CHECK (nivel IN ('junior','pleno','senior','especialista')),
  disponibilidade text CHECK (disponibilidade IN ('imediata','ate_15d','ate_30d','indisponivel')) DEFAULT 'imediata',
  valor_hora_min numeric(10,2),
  whatsapp text,
  instagram text,
  linkedin text,
  behance text,
  site text,
  verificado boolean NOT NULL DEFAULT false,
  destaque boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  views int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.freelancers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.freelancers TO authenticated;
GRANT ALL ON public.freelancers TO service_role;

ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancers ativos são públicos"
  ON public.freelancers FOR SELECT
  USING (ativo = true OR user_id = auth.uid());

CREATE POLICY "Dono cria seu perfil freela"
  ON public.freelancers FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Dono edita seu perfil freela"
  ON public.freelancers FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Dono apaga seu perfil freela"
  ON public.freelancers FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_freelancers_categoria ON public.freelancers(categoria_principal) WHERE ativo;
CREATE INDEX idx_freelancers_cidade ON public.freelancers(lower(cidade)) WHERE ativo;
CREATE INDEX idx_freelancers_destaque ON public.freelancers(destaque, created_at DESC) WHERE ativo;

CREATE TRIGGER trg_freelancers_updated_at BEFORE UPDATE ON public.freelancers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2) PROJETOS
CREATE TABLE public.freelancer_projetos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL REFERENCES public.freelancers(id) ON DELETE CASCADE,
  slug text NOT NULL,
  titulo text NOT NULL,
  descricao text,
  cliente_nome text,
  ano int,
  link_externo text,
  tags text[] NOT NULL DEFAULT '{}',
  imagens text[] NOT NULL DEFAULT '{}',
  capa_url text,
  publicado boolean NOT NULL DEFAULT true,
  ordem int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (freelancer_id, slug)
);

GRANT SELECT ON public.freelancer_projetos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.freelancer_projetos TO authenticated;
GRANT ALL ON public.freelancer_projetos TO service_role;

ALTER TABLE public.freelancer_projetos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projetos publicados são públicos"
  ON public.freelancer_projetos FOR SELECT
  USING (
    publicado = true
    OR EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_id AND f.user_id = auth.uid())
  );

CREATE POLICY "Freela gerencia seus projetos"
  ON public.freelancer_projetos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_id AND f.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_id AND f.user_id = auth.uid()));

CREATE INDEX idx_projetos_freelancer ON public.freelancer_projetos(freelancer_id, ordem);

CREATE TRIGGER trg_freelancer_projetos_updated_at BEFORE UPDATE ON public.freelancer_projetos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3) ORÇAMENTOS
CREATE TABLE public.freelancer_orcamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL REFERENCES public.freelancers(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nome text NOT NULL,
  whatsapp text NOT NULL,
  email text,
  descricao text NOT NULL,
  orcamento_alvo numeric(10,2),
  prazo_dias int,
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','respondido','fechado','perdido')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.freelancer_orcamentos TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.freelancer_orcamentos TO authenticated;
GRANT ALL ON public.freelancer_orcamentos TO service_role;

ALTER TABLE public.freelancer_orcamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode enviar orçamento"
  ON public.freelancer_orcamentos FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Freela vê seus orçamentos"
  ON public.freelancer_orcamentos FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_id AND f.user_id = auth.uid())
    OR cliente_id = auth.uid()
  );

CREATE POLICY "Freela atualiza status do orçamento"
  ON public.freelancer_orcamentos FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_id AND f.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_id AND f.user_id = auth.uid()));

CREATE INDEX idx_orcamentos_freela_status ON public.freelancer_orcamentos(freelancer_id, status, created_at DESC);

CREATE TRIGGER trg_freelancer_orcamentos_updated_at BEFORE UPDATE ON public.freelancer_orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4) AVALIAÇÕES
CREATE TABLE public.freelancer_avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL REFERENCES public.freelancers(id) ON DELETE CASCADE,
  autor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  autor_nome text NOT NULL,
  autor_empresa text,
  nota int NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario text NOT NULL,
  aprovada boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.freelancer_avaliacoes TO anon;
GRANT INSERT ON public.freelancer_avaliacoes TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.freelancer_avaliacoes TO authenticated;
GRANT ALL ON public.freelancer_avaliacoes TO service_role;

ALTER TABLE public.freelancer_avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Avaliações aprovadas são públicas"
  ON public.freelancer_avaliacoes FOR SELECT
  USING (
    aprovada = true
    OR EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_id AND f.user_id = auth.uid())
    OR autor_id = auth.uid()
  );

CREATE POLICY "Qualquer um pode enviar avaliação"
  ON public.freelancer_avaliacoes FOR INSERT TO anon, authenticated
  WITH CHECK (aprovada = false);

CREATE POLICY "Freela aprova/edita avaliações dele"
  ON public.freelancer_avaliacoes FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_id AND f.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_id AND f.user_id = auth.uid()));

CREATE POLICY "Freela remove avaliações dele"
  ON public.freelancer_avaliacoes FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_id AND f.user_id = auth.uid()));

CREATE INDEX idx_avaliacoes_freelancer ON public.freelancer_avaliacoes(freelancer_id, aprovada);

-- 5) NOTIFICAÇÃO DE NOVO ORÇAMENTO
CREATE OR REPLACE FUNCTION public.notify_freela_novo_orcamento()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _dono uuid;
BEGIN
  SELECT f.user_id INTO _dono FROM public.freelancers f WHERE f.id = NEW.freelancer_id;
  IF _dono IS NOT NULL THEN
    INSERT INTO public.notificacoes (user_id, titulo, mensagem, link)
    VALUES (_dono, '💼 Novo pedido de orçamento',
            NEW.nome || ' quer conversar sobre um projeto',
            '/freelancer/orcamentos');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_freela_orcamento
  AFTER INSERT ON public.freelancer_orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.notify_freela_novo_orcamento();