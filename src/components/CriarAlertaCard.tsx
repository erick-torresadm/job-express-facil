import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function CriarAlertaCard({ profissao, cidade }: { profissao: string; cidade: string }) {
  const { user } = useAuth();
  const [existe, setExiste] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("alertas").select("id")
      .eq("user_id", user.id).eq("ativo", true)
      .ilike("profissao", profissao).ilike("cidade", cidade)
      .maybeSingle().then(({ data }) => setExiste(data?.id ?? null));
  }, [user, profissao, cidade]);

  const toggle = async () => {
    if (!user) {
      toast.info("Entre para criar alertas de vagas");
      return;
    }
    setLoading(true);
    try {
      if (existe) {
        await supabase.from("alertas").delete().eq("id", existe);
        setExiste(null);
        toast.success("Alerta removido");
      } else {
        const { data } = await supabase.from("alertas")
          .insert({ user_id: user.id, profissao, cidade, ativo: true })
          .select("id").single();
        setExiste(data?.id ?? null);
        toast.success("Alerta criado! Avisaremos quando aparecer vaga.");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-4">
      <div className="min-w-0">
        <p className="text-sm font-bold">🔔 Avisar quando entrar vaga nova</p>
        <p className="text-xs text-muted-foreground truncate">
          {profissao} em {cidade}
        </p>
      </div>
      {user ? (
        <button onClick={toggle} disabled={loading}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${
            existe ? "border border-border bg-card text-muted-foreground" : "bg-accent text-accent-foreground"
          }`}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : existe ? <><BellOff className="h-3.5 w-3.5" /> Remover</> : <><Bell className="h-3.5 w-3.5" /> Criar alerta</>}
        </button>
      ) : (
        <Link to="/auth" className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-foreground">
          <Bell className="h-3.5 w-3.5" /> Entrar
        </Link>
      )}
    </div>
  );
}
