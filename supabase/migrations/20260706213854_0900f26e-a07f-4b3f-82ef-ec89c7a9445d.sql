-- Coluna que marca até quando o usuário tem Pro grátis pela promoção de lançamento
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS promo_pro_ate timestamptz;

COMMENT ON COLUMN public.profiles.promo_pro_ate IS
  'Promoção de lançamento: usuário tem acesso Pro grátis até esta data. Concedido em cadastros feitos entre 2026-07-06 e 2027-01-06.';

-- Backfill: todos os usuários já cadastrados recebem 2 anos de Pro grátis
UPDATE public.profiles
   SET promo_pro_ate = (now() + interval '2 years')
 WHERE promo_pro_ate IS NULL;

-- Função helper: verifica se usuário está Pro (promo ativa OU assinatura ativa)
CREATE OR REPLACE FUNCTION public.has_pro_ativo(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.profiles
       WHERE id = _user_id
         AND promo_pro_ate IS NOT NULL
         AND promo_pro_ate > now()
    )
    OR EXISTS (
      SELECT 1 FROM public.assinaturas
       WHERE empresa_id = _user_id
         AND status = 'ativa'
    );
$$;

GRANT EXECUTE ON FUNCTION public.has_pro_ativo(uuid) TO authenticated, anon;

-- Atualiza trigger de novo usuário para conceder promoção enquanto a janela estiver aberta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _requested text;
  _role app_role;
  _promo_fim constant timestamptz := '2027-01-06 23:59:59+00';
  _promo_ate timestamptz;
BEGIN
  _requested := lower(coalesce(NEW.raw_user_meta_data->>'role',''));
  IF _requested = 'empresa' THEN
    _role := 'empresa'::app_role;
  ELSE
    _role := 'candidato'::app_role;
  END IF;

  -- Se estivermos dentro da janela promocional (até 06/01/2027), concede Pro por 2 anos
  IF now() <= _promo_fim THEN
    _promo_ate := now() + interval '2 years';
  ELSE
    _promo_ate := NULL;
  END IF;

  INSERT INTO public.profiles (id, full_name, whatsapp, company_name, cpf_cnpj, promo_pro_ate)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'company_name',
    NULLIF(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'cpf_cnpj',''), '\D', '', 'g'), '')
      ,
    _promo_ate
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;