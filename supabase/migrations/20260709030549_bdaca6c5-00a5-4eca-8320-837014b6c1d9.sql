-- 1) Preferências de notificação no freelancer
ALTER TABLE public.freelancers
  ADD COLUMN IF NOT EXISTS notif_email BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notif_email_endereco TEXT,
  ADD COLUMN IF NOT EXISTS notif_wa BOOLEAN NOT NULL DEFAULT FALSE;

-- 2) Políticas de storage para o bucket freelas-portfolio
-- Estrutura de pastas esperada: {user_id}/{arquivo}
DROP POLICY IF EXISTS "freelas_portfolio_public_read" ON storage.objects;
CREATE POLICY "freelas_portfolio_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'freelas-portfolio');

DROP POLICY IF EXISTS "freelas_portfolio_owner_insert" ON storage.objects;
CREATE POLICY "freelas_portfolio_owner_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'freelas-portfolio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "freelas_portfolio_owner_update" ON storage.objects;
CREATE POLICY "freelas_portfolio_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'freelas-portfolio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "freelas_portfolio_owner_delete" ON storage.objects;
CREATE POLICY "freelas_portfolio_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'freelas-portfolio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );