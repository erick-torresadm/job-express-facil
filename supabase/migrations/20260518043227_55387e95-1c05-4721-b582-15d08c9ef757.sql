
DROP POLICY "curriculos_anon_insert" ON public.curriculos;

CREATE POLICY "curriculos_insert_self_or_anon" ON public.curriculos
  FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
