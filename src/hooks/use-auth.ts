import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type Role = "candidato" | "empresa" | "admin";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadRole(s.user.id), 0);
      } else {
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadRole(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadRole = async (uid: string) => {
    // Um usuário pode ter múltiplos papéis (ex.: admin + empresa).
    // Escolhemos o de maior prioridade: admin > empresa > candidato.
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    const roles = (data ?? []).map((r) => r.role as Role);
    const chosen: Role | null = roles.includes("admin")
      ? "admin"
      : roles.includes("empresa")
        ? "empresa"
        : roles.includes("candidato")
          ? "candidato"
          : null;
    setRole(chosen);
  };

  // Sign-out hygiene: cancela queries em voo → limpa cache → encerra sessão.
  const signOut = async () => {
    try {
      await queryClient.cancelQueries();
    } catch { /* noop */ }
    queryClient.clear();
    const res = await supabase.auth.signOut();
    setRole(null);
    return res;
  };

  return { session, user, role, loading, signOut };
}
