import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "va_sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid =
      (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).slice(0, 64);
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/** Beacon simples de pageview. Roda só no cliente, uma vez por rota. */
export function PageViewTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastSent = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pathname || lastSent.current === pathname) return;
    // ignora rotas admin/auth do próprio owner
    if (pathname.startsWith("/admin") || pathname.startsWith("/_")) return;
    lastSent.current = pathname;

    const send = async () => {
      const sid = getSessionId();
      let userId: string | null = null;
      try {
        const { data } = await supabase.auth.getSession();
        userId = data.session?.user?.id ?? null;
      } catch {
        /* noop */
      }
      const body = JSON.stringify({
        path: pathname,
        session_id: sid,
        referrer: document.referrer || null,
        user_id: userId,
      });
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/public/track",
            new Blob([body], { type: "application/json" }),
          );
        } else {
          void fetch("/api/public/track", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body,
            keepalive: true,
          });
        }
      } catch {
        /* silencioso */
      }
    };
    // pequeno delay pra não competir com FCP
    const t = setTimeout(send, 400);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
