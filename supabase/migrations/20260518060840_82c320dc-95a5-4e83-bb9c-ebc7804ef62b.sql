ALTER TABLE public.profiles
  ADD COLUMN cpf_cnpj text,
  ADD COLUMN asaas_customer_id text;

CREATE TYPE public.plano_tipo AS ENUM ('basico', 'full');
CREATE TYPE public.plano_ciclo AS ENUM ('mensal', 'anual');
CREATE TYPE public.assinatura_status AS ENUM ('pendente', 'ativa', 'atrasada', 'cancelada');

CREATE TABLE public.assinaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  plano public.plano_tipo NOT NULL,
  ciclo public.plano_ciclo NOT NULL,
  status public.assinatura_status NOT NULL DEFAULT 'pendente',
  valor numeric(10,2) NOT NULL,
  asaas_customer_id text,
  asaas_subscription_id text UNIQUE,
  proximo_vencimento date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_assinaturas_empresa ON public.assinaturas(empresa_id);
CREATE INDEX idx_assinaturas_asaas_sub ON public.assinaturas(asaas_subscription_id);

ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assinaturas_empresa_select" ON public.assinaturas
  FOR SELECT TO authenticated USING (auth.uid() = empresa_id);

CREATE TRIGGER assinaturas_touch BEFORE UPDATE ON public.assinaturas
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();