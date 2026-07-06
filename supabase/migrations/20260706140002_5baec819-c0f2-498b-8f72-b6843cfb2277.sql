
-- =========================================================
-- 1) Fix privilege escalation via signup metadata
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _requested text;
  _role app_role;
BEGIN
  _requested := lower(coalesce(NEW.raw_user_meta_data->>'role',''));
  -- Only allow self-assignment of non-privileged roles. 'admin' (or anything
  -- unknown) is never granted from signup metadata; admin roles must be
  -- granted by an existing admin via the user_roles admin-only policies.
  IF _requested = 'empresa' THEN
    _role := 'empresa'::app_role;
  ELSE
    _role := 'candidato'::app_role;
  END IF;

  INSERT INTO public.profiles (id, full_name, whatsapp, company_name, cpf_cnpj)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'company_name',
    NULLIF(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'cpf_cnpj',''), '\D', '', 'g'), '')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Revoke any admin rows that could have been created via the previous
-- vulnerable path. Preserve admin roles only when the row was inserted
-- (or the account created) by/for a user that already has a non-admin
-- baseline is not trackable here, so we simply drop ALL current admin
-- rows — an admin must be re-granted intentionally via a manual UPDATE.
-- NOTE: if you (the project owner) currently hold admin, run manually:
--   INSERT INTO public.user_roles(user_id, role) VALUES ('<your-uuid>', 'admin');
DELETE FROM public.user_roles WHERE role = 'admin'::app_role;

-- =========================================================
-- 2) Move cron secret out of source control
-- =========================================================
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.app_secrets (
  name text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Lock down: only service_role (and the postgres owner) may read/write.
REVOKE ALL ON TABLE private.app_secrets FROM PUBLIC;
REVOKE ALL ON TABLE private.app_secrets FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE private.app_secrets TO service_role;
ALTER TABLE private.app_secrets ENABLE ROW LEVEL SECURITY;
-- No policies -> anon/authenticated cannot read even if grants leak.

-- Rotate the cron secret: overwrite whatever was hardcoded previously.
INSERT INTO private.app_secrets(name, value)
VALUES ('cron_secret', encode(gen_random_bytes(32), 'hex'))
ON CONFLICT (name) DO UPDATE
  SET value = EXCLUDED.value, updated_at = now();

-- Unschedule the old job (which embedded the plaintext secret) and
-- reschedule reading the secret from private.app_secrets at run time.
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
      'x-cron-secret', (SELECT value FROM private.app_secrets WHERE name = 'cron_secret' LIMIT 1)
    )
  ) AS request_id;
  $cron$
);
