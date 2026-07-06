CREATE OR REPLACE FUNCTION public.has_pro_ativo(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
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
$function$;