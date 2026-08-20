-- Create avatars bucket for candidate profile pictures
INSERT INTO storage.buckets (id, name, owner, public, created_at, updated_at)
VALUES ('avatars', 'avatars', NULL, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for avatars bucket
-- Allow public read access (avatars are public)
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatars
CREATE POLICY "avatars_user_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to update/delete their own avatars
CREATE POLICY "avatars_user_update_delete"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_user_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
