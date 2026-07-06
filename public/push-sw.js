// Service Worker dedicado a Web Push (não é PWA/offline).
// Recebe notificações e abre o admin ao clicar.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = { title: "VagasAgora", body: "Nova atividade", url: "/admin" };
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch (e) {
    try {
      payload.body = event.data ? event.data.text() : payload.body;
    } catch (_) {}
  }

  const options = {
    body: payload.body,
    icon: payload.icon || "/favicon.ico",
    badge: payload.badge || "/favicon.ico",
    data: { url: payload.url || "/admin" },
    tag: payload.tag || "vagasagora",
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/admin";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(targetUrl) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    }),
  );
});

// Persistência: quando o navegador rotaciona o endpoint (após dias sem uso,
// mudança de conta do Push Service, etc.), re-registramos automaticamente
// sem depender de sessão do usuário. É o que faz o push continuar
// chegando mesmo se o admin desloga.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const oldEndpoint = event.oldSubscription && event.oldSubscription.endpoint;
        let newSub = event.newSubscription;
        if (!newSub && event.oldSubscription) {
          try {
            newSub = await self.registration.pushManager.subscribe(event.oldSubscription.options);
          } catch (_) {
            newSub = null;
          }
        }
        if (!newSub || !oldEndpoint) return;
        const json = newSub.toJSON();
        await fetch("/api/public/push/renew", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            oldEndpoint,
            newEndpoint: newSub.endpoint,
            p256dh: json.keys && json.keys.p256dh,
            auth: json.keys && json.keys.auth,
          }),
          keepalive: true,
        });
      } catch (err) {
        // best-effort
      }
    })(),
  );
});
