REVOKE ALL ON FUNCTION public.has_pro_ativo(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_pro_ativo(uuid) TO authenticated, service_role;