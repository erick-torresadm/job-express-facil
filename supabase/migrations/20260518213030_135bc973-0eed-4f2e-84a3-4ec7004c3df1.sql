
-- 1) Tighten profiles RLS: drop blanket "true" SELECT policy.
-- All cross-user profile reads in the app go through supabaseAdmin (server-side),
-- so removing this policy doesn't break public profile pages.
DROP POLICY IF EXISTS profiles_public_select_authenticated ON public.profiles;

-- 2) Fix curriculos_owner_update: scope to authenticated role (was {public}).
DROP POLICY IF EXISTS curriculos_owner_update ON public.curriculos;
CREATE POLICY curriculos_owner_update ON public.curriculos
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3) Lock down user_roles writes explicitly (defense-in-depth).
-- No INSERT/UPDATE/DELETE policies exist, so RLS already blocks non-service writes,
-- but add explicit restrictive policies to make intent clear.
CREATE POLICY user_roles_no_user_insert ON public.user_roles
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY user_roles_no_user_update ON public.user_roles
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY user_roles_no_user_delete ON public.user_roles
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4) Storage: add UPDATE/DELETE policies on verificacao-docs bucket.
CREATE POLICY "verificacao_docs_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'verificacao-docs'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'::app_role))
  );
CREATE POLICY "verificacao_docs_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'verificacao-docs'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'::app_role))
  );
