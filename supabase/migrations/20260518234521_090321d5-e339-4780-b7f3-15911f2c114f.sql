
CREATE POLICY "posts_admin_select" ON public.posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "posts_admin_insert" ON public.posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "posts_admin_update" ON public.posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "posts_admin_delete" ON public.posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
