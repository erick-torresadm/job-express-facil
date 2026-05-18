ALTER TABLE public.candidaturas
  ADD CONSTRAINT candidaturas_vaga_id_fkey FOREIGN KEY (vaga_id) REFERENCES public.vagas(id) ON DELETE CASCADE,
  ADD CONSTRAINT candidaturas_curriculo_id_fkey FOREIGN KEY (curriculo_id) REFERENCES public.curriculos(id) ON DELETE CASCADE,
  ADD CONSTRAINT candidaturas_candidato_id_fkey FOREIGN KEY (candidato_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT candidaturas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.favoritos
  ADD CONSTRAINT favoritos_vaga_id_fkey FOREIGN KEY (vaga_id) REFERENCES public.vagas(id) ON DELETE CASCADE,
  ADD CONSTRAINT favoritos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.alertas
  ADD CONSTRAINT alertas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.curriculos
  ADD CONSTRAINT curriculos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.revelacoes
  ADD CONSTRAINT revelacoes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT revelacoes_curriculo_id_fkey FOREIGN KEY (curriculo_id) REFERENCES public.curriculos(id) ON DELETE CASCADE;