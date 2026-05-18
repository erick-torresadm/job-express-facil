-- Trigger que dispara handle_new_user() quando um usuário é criado no Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Permite que o candidato logado "reivindique" um currículo recém criado (user_id ainda NULL)
DROP POLICY IF EXISTS curriculos_claim_anon ON public.curriculos;
CREATE POLICY curriculos_claim_anon
  ON public.curriculos
  FOR UPDATE
  TO authenticated
  USING (user_id IS NULL)
  WITH CHECK (user_id = auth.uid());