import { useEffect, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Notif = {
  id: string;
  titulo: string;
  mensagem: string | null;
  link: string | null;
  lida: boolean;
  created_at: string;
};

export function NotificationBell({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("notificacoes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (active && data) setItems(data as Notif[]);
      });

    const ch = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacoes", filter: `user_id=eq.${user.id}` },
        (payload) => setItems((prev) => [payload.new as Notif, ...prev].slice(0, 20)),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(ch);
    };
  }, [user]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;
  const naoLidas = items.filter((i) => !i.lida).length;

  const marcarTodas = async () => {
    const ids = items.filter((i) => !i.lida).map((i) => i.id);
    if (!ids.length) return;
    setItems((prev) => prev.map((i) => ({ ...i, lida: true })));
    await supabase.from("notificacoes").update({ lida: true }).in("id", ids);
  };

  const marcarUma = async (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, lida: true } : i)));
    await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
  };

  const btnCls =
    tone === "dark"
      ? "relative grid h-9 w-9 place-items-center rounded-full text-primary-foreground hover:bg-primary-foreground/10"
      : "relative grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-secondary";

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-label="Notificações" className={btnCls}>
        <Bell className="h-4 w-4" />
        {naoLidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-bold">Notificações</p>
            {naoLidas > 0 && (
              <button onClick={marcarTodas} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                <Check className="h-3 w-3" /> Marcar todas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Sem notificações ainda.</p>
            ) : (
              items.map((n) => {
                const body = (
                  <div className={`flex gap-3 border-b border-border px-4 py-3 last:border-0 ${n.lida ? "opacity-60" : "bg-secondary/40"}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.lida ? "bg-muted" : "bg-primary"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-tight">{n.titulo}</p>
                      {n.mensagem && <p className="mt-0.5 text-xs text-muted-foreground">{n.mensagem}</p>}
                      <p className="mt-1 text-[10px] uppercase text-muted-foreground">
                        {new Date(n.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} to={n.link} onClick={() => { marcarUma(n.id); setOpen(false); }} className="block hover:bg-secondary/60">
                    {body}
                  </Link>
                ) : (
                  <button key={n.id} onClick={() => marcarUma(n.id)} className="block w-full text-left hover:bg-secondary/60">
                    {body}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
