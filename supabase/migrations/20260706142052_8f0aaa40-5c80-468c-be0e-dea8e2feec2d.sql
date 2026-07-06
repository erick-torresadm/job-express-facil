DROP POLICY IF EXISTS follows_select_all ON public.follows;
CREATE POLICY follows_select_self ON public.follows
  FOR SELECT TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);