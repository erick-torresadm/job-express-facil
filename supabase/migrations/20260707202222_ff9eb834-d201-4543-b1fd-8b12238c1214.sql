
-- 1) Revoke EXECUTE from anon/authenticated/public on SECURITY DEFINER functions
--    These are only invoked by triggers (owner runs them) or by other SECURITY DEFINER
--    server code; no client should call them directly.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_candidatos_nova_vaga() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_empresas_novo_curriculo() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_alertas_nova_vaga() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_freela_novo_orcamento() FROM PUBLIC, anon, authenticated;

-- has_pro_ativo is SECURITY DEFINER-style helper used in policies/app; keep executable
-- by authenticated only (revoke anon + public).
REVOKE ALL ON FUNCTION public.has_pro_ativo(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_pro_ativo(uuid) TO authenticated;

-- 2) Replace the always-true INSERT policy on freelancer_orcamentos with a
--    validated one. Keeps the public contact-form UX but requires plausible data.
DROP POLICY IF EXISTS "Qualquer um pode enviar orçamento" ON public.freelancer_orcamentos;

CREATE POLICY "Qualquer um pode enviar orçamento"
  ON public.freelancer_orcamentos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    freelancer_id IS NOT NULL
    AND nome IS NOT NULL
    AND length(btrim(nome)) BETWEEN 2 AND 120
    AND descricao IS NOT NULL
    AND length(btrim(descricao)) BETWEEN 10 AND 4000
    AND (
      (whatsapp IS NOT NULL AND length(btrim(whatsapp)) BETWEEN 8 AND 20)
      OR (email IS NOT NULL AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 200)
    )
  );
