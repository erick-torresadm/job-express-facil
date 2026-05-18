-- 1) CURRICULOS: bloquear leitura pública direta (servidor entrega versão sanitizada)
DROP POLICY IF EXISTS curriculos_public_select ON public.curriculos;
DROP POLICY IF EXISTS curriculos_claim_anon ON public.curriculos;
DROP POLICY IF EXISTS curriculos_authenticated_select ON public.curriculos;

CREATE POLICY curriculos_owner_select ON public.curriculos FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY curriculos_empresa_select_via_revelacao ON public.curriculos FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'empresa')
    AND EXISTS (
      SELECT 1 FROM public.revelacoes r
      WHERE r.curriculo_id = curriculos.id AND r.empresa_id = auth.uid()
    )
  );

CREATE POLICY curriculos_empresa_select_via_candidatura ON public.curriculos FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'empresa')
    AND EXISTS (
      SELECT 1 FROM public.candidaturas c
      WHERE c.curriculo_id = curriculos.id AND c.empresa_id = auth.uid()
    )
  );

CREATE POLICY curriculos_admin_select ON public.curriculos FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) PROFILES: empresa só vê candidato com relação existente
DROP POLICY IF EXISTS profiles_empresa_view_candidatos ON public.profiles;

CREATE POLICY profiles_empresa_via_relacao ON public.profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'empresa')
    AND public.has_role(id, 'candidato')
    AND (
      EXISTS (SELECT 1 FROM public.revelacoes r
              WHERE r.empresa_id = auth.uid()
                AND r.curriculo_id IN (SELECT id FROM public.curriculos WHERE user_id = profiles.id))
      OR EXISTS (SELECT 1 FROM public.candidaturas c
                 WHERE c.empresa_id = auth.uid() AND c.candidato_id = profiles.id)
    )
  );

-- 3) Candidato precisa ler perfil da empresa pra exibir nome/logo (público mínimo)
DROP POLICY IF EXISTS profiles_empresa_publica ON public.profiles;
CREATE POLICY profiles_empresa_publica ON public.profiles FOR SELECT TO anon, authenticated
  USING (slug_publico IS NOT NULL);