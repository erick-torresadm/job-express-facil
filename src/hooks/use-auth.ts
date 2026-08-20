import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type Role = "candidato" | "empresa" | "admin";

export type AuthProfile = {
  avatar_url: string | null;
  full_name: string | null;
  company_name: string | null;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadRoleEProfile(s.user.id), 0);
      } else {
        setRole(null);
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadRoleEProfile(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadRoleEProfile = async (uid: string) => {
    const [{ data: rolesData }, { data: profileData }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("avatar_url, full_name, company_name").eq("id", uid).maybeSingle(),
    ]);
    // Um usuário pode ter múltiplos papéis (ex.: admin + empresa).
    // Escolhemos o de maior prioridade: admin > empresa > candidato.
    const roles = (rolesData ?? []).map((r) => r.role as Role);
    const chosen: Role | null = roles.includes("admin")
      ? "admin"
      : roles.includes("empresa")
        ? "empresa"
        : roles.includes("candidato")
          ? "candidato"
          : null;
    setRole(chosen);
    setProfile(profileData ?? null);
  };

  // Sign-out hygiene: cancela queries em voo → limpa cache → encerra sessão.
  const signOut = async () => {
    try {
      await queryClient.cancelQueries();
    } catch { /* noop */ }
    queryClient.clear();
    const res = await supabase.auth.signOut();
    setRole(null);
    setProfile(null);
    return res;
  };

  return { session, user, role, profile, loading, signOut };
}
