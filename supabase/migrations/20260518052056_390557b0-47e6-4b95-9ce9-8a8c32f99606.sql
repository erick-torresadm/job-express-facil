
DROP POLICY IF EXISTS "notif_authenticated_insert" ON public.notificacoes;
CREATE POLICY "notif_self_insert" ON public.notificacoes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

REVOKE EXECUTE ON FUNCTION public.notify_candidatos_nova_vaga() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_empresas_novo_curriculo() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
