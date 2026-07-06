import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, CheckCircle2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  getVapidPublicKey,
  savePushSubscription,
  deletePushSubscription,
  sendTestPush,
} from "@/lib/push.functions";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function bufferToBase64Url(buf: ArrayBuffer | null): Promise<string> {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

type State = "unsupported" | "checking" | "denied" | "off" | "on" | "loading";

export function PushToggle() {
  const [state, setState] = useState<State>("checking");
  const [msg, setMsg] = useState<string | null>(null);
  const fetchKey = useServerFn(getVapidPublicKey);
  const saveSub = useServerFn(savePushSubscription);
  const deleteSub = useServerFn(deletePushSubscription);
  const testPush = useServerFn(sendTestPush);

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.getRegistration("/push-sw.js");
        const sub = await reg?.pushManager.getSubscription();
        setState(sub ? "on" : "off");
      } catch {
        setState("off");
      }
    })();
  }, []);

  const enable = async () => {
    setMsg(null);
    setState("loading");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState("denied");
        setMsg("Permissão negada. Ative nas configurações do navegador.");
        return;
      }
      const reg = await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
      const { publicKey } = await fetchKey();
      if (!publicKey) throw new Error("VAPID_PUBLIC_KEY ausente no servidor.");

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const key = urlBase64ToUint8Array(publicKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer,
        });
      }
      const json = sub.toJSON();
      const p256dh = json.keys?.p256dh ?? (await bufferToBase64Url(sub.getKey("p256dh")));
      const auth = json.keys?.auth ?? (await bufferToBase64Url(sub.getKey("auth")));

      await saveSub({
        data: {
          endpoint: sub.endpoint,
          p256dh,
          auth,
          userAgent: navigator.userAgent.slice(0, 500),
        },
      });

      await testPush().catch(() => null);
      setState("on");
      setMsg("Notificações ativadas! Enviamos um teste agora.");
    } catch (err) {
      console.error(err);
      setState("off");
      setMsg(err instanceof Error ? err.message : "Falha ao ativar notificações.");
    }
  };

  const disable = async () => {
    setMsg(null);
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.getRegistration("/push-sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await deleteSub({ data: { endpoint: sub.endpoint } }).catch(() => null);
        await sub.unsubscribe();
      }
      setState("off");
      setMsg("Notificações desativadas.");
    } catch {
      setState("off");
    }
  };

  if (state === "checking") return null;
  if (state === "unsupported") {
    return (
      <div className="rounded-2xl border-2 border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <BellOff className="mr-2 inline h-4 w-4" />
        Este navegador não suporta notificações push.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-bold">
            {state === "on" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Bell className="h-4 w-4" />}
            Notificações Push no Admin
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {state === "on"
              ? "Você receberá um aviso instantâneo aqui e no seu celular sobre novos cadastros e vagas."
              : "Ative para receber avisos em tempo real, mesmo com o site fechado."}
          </p>
        </div>
        {state === "on" ? (
          <button
            onClick={disable}
            className="shrink-0 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-bold hover:bg-muted"
          >
            Desativar
          </button>
        ) : state === "denied" ? (
          <span className="shrink-0 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
            Bloqueado no navegador
          </span>
        ) : (
          <button
            onClick={enable}
            disabled={state === "loading"}
            className="shrink-0 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground shadow-pop disabled:opacity-60"
          >
            {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ativar"}
          </button>
        )}
      </div>
      {msg && <p className="mt-2 text-xs text-muted-foreground">{msg}</p>}
    </div>
  );
}
