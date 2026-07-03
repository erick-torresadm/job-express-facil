
-- 1) Private schema + private.has_role
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- 2) Recreate policies referencing public.has_role -> private.has_role

DROP POLICY IF EXISTS anuncios_admin_all ON public.anuncios;
CREATE POLICY anuncios_admin_all ON public.anuncios
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS curriculos_admin_select ON public.curriculos;
CREATE POLICY curriculos_admin_select ON public.curriculos
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS curriculos_empresa_select_via_candidatura ON public.curriculos;
CREATE POLICY curriculos_empresa_select_via_candidatura ON public.curriculos
  FOR SELECT TO authenticated
  USING (
    private.has_role(auth.uid(), 'empresa'::public.app_role)
    AND EXISTS (
      SELECT 1 FROM public.candidaturas c
      WHERE c.empresa_id = auth.uid() AND c.curriculo_id = curriculos.id
    )
  );

DROP POLICY IF EXISTS curriculos_empresa_select_via_revelacao ON public.curriculos;
CREATE POLICY curriculos_empresa_select_via_revelacao ON public.curriculos
  FOR SELECT TO authenticated
  USING (
    private.has_role(auth.uid(), 'empresa'::public.app_role)
    AND EXISTS (
      SELECT 1 FROM public.revelacoes r
      WHERE r.empresa_id = auth.uid() AND r.curriculo_id = curriculos.id
    )
  );

DROP POLICY IF EXISTS posts_admin_delete ON public.posts;
CREATE POLICY posts_admin_delete ON public.posts
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS posts_admin_insert ON public.posts;
CREATE POLICY posts_admin_insert ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS posts_admin_select ON public.posts;
CREATE POLICY posts_admin_select ON public.posts
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS posts_admin_update ON public.posts;
CREATE POLICY posts_admin_update ON public.posts
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS profiles_admin_select ON public.profiles;
CREATE POLICY profiles_admin_select ON public.profiles
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS profiles_admin_update ON public.profiles;
CREATE POLICY profiles_admin_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) Remove sensitive-field-exposing policy entirely
DROP POLICY IF EXISTS profiles_empresa_via_relacao ON public.profiles;

DROP POLICY IF EXISTS revelacoes_self_insert ON public.revelacoes;
CREATE POLICY revelacoes_self_insert ON public.revelacoes
  FOR INSERT TO authenticated
  WITH CHECK (
    empresa_id = auth.uid()
    AND private.has_role(auth.uid(), 'empresa'::public.app_role)
  );

DROP POLICY IF EXISTS user_roles_no_user_delete ON public.user_roles;
CREATE POLICY user_roles_no_user_delete ON public.user_roles
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS user_roles_no_user_insert ON public.user_roles;
CREATE POLICY user_roles_no_user_insert ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS user_roles_no_user_update ON public.user_roles;
CREATE POLICY user_roles_no_user_update ON public.user_roles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS vagas_empresa_insert ON public.vagas;
CREATE POLICY vagas_empresa_insert ON public.vagas
  FOR INSERT TO authenticated
  WITH CHECK (
    empresa_id = auth.uid()
    AND private.has_role(auth.uid(), 'empresa'::public.app_role)
  );

DROP POLICY IF EXISTS verif_admin_update ON public.verificacoes;
CREATE POLICY verif_admin_update ON public.verificacoes
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS verif_self_insert ON public.verificacoes;
CREATE POLICY verif_self_insert ON public.verificacoes
  FOR INSERT TO authenticated
  WITH CHECK (
    empresa_id = auth.uid()
    AND private.has_role(auth.uid(), 'empresa'::public.app_role)
  );

DROP POLICY IF EXISTS verif_self_select ON public.verificacoes;
CREATE POLICY verif_self_select ON public.verificacoes
  FOR SELECT TO authenticated
  USING (
    empresa_id = auth.uid()
    OR private.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Storage policies
DROP POLICY IF EXISTS verif_docs_owner_select ON storage.objects;
CREATE POLICY verif_docs_owner_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'verificacao-docs'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR private.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

DROP POLICY IF EXISTS verificacao_docs_owner_update ON storage.objects;
CREATE POLICY verificacao_docs_owner_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'verificacao-docs'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR private.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

DROP POLICY IF EXISTS verificacao_docs_owner_delete ON storage.objects;
CREATE POLICY verificacao_docs_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'verificacao-docs'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR private.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

-- 4) Drop public.has_role
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 5) Revoke exec on trigger-only function
REVOKE ALL ON FUNCTION public.notify_alertas_nova_vaga() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_alertas_nova_vaga() FROM anon, authenticated;

-- 6) Reschedule pg_cron with dedicated secret
DO $$
BEGIN
  PERFORM cron.unschedule('vagasagora-gerar-posts-diario');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'vagasagora-gerar-posts-diario',
  '0 12 * * *',
  $cron$
  SELECT net.http_get(
    url := 'https://project--f540e22b-4e9f-464c-a652-5e61aa0a6160.lovable.app/api/public/cron/gerar-post?qtd=5',
    headers := jsonb_build_object(
      'x-cron-secret', '788bd6f064bfa9337d8b9d720efd9223372b19333d352b773b40c96646c8c6c8'
    )
  ) AS request_id;
  $cron$
);
