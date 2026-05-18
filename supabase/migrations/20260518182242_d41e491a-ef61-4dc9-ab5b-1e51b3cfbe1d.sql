-- ============ Perfil social: campos extras ============
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio_social text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handle text;

-- Validação de bio (max 500)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_bio_social_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_bio_social_check
  CHECK (bio_social IS NULL OR length(bio_social) <= 500);

-- Validação de handle: 3-30 chars, lowercase alfanumérico + underline
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_handle_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_handle_check
  CHECK (handle IS NULL OR handle ~ '^[a-z0-9_]{3,30}$');

-- Handle único
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_unique ON public.profiles (handle) WHERE handle IS NOT NULL;

-- ============ Política: perfis ficam visíveis para qualquer logado (rede social) ============
-- (Mantém as policies existentes; adiciona uma de leitura ampla por usuários autenticados)
DROP POLICY IF EXISTS profiles_public_select_authenticated ON public.profiles;
CREATE POLICY profiles_public_select_authenticated
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- ============ Tabela follows ============
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT follows_no_self CHECK (follower_id <> following_id),
  CONSTRAINT follows_unique UNIQUE (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_idx ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS follows_following_idx ON public.follows (following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS follows_select_all ON public.follows;
CREATE POLICY follows_select_all ON public.follows
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS follows_insert_self ON public.follows;
CREATE POLICY follows_insert_self ON public.follows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS follows_delete_self ON public.follows;
CREATE POLICY follows_delete_self ON public.follows
  FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- ============ Storage bucket social-media (público) ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-media', 'social-media', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública
DROP POLICY IF EXISTS "social_media_public_read" ON storage.objects;
CREATE POLICY "social_media_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'social-media');

-- Upload: só o dono na própria pasta {user_id}/...
DROP POLICY IF EXISTS "social_media_owner_insert" ON storage.objects;
CREATE POLICY "social_media_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'social-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update: só o dono
DROP POLICY IF EXISTS "social_media_owner_update" ON storage.objects;
CREATE POLICY "social_media_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'social-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Delete: só o dono
DROP POLICY IF EXISTS "social_media_owner_delete" ON storage.objects;
CREATE POLICY "social_media_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'social-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );