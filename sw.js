const CACHE = "spanish-sentences-v3";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const isDoc = e.request.destination === "document"
    || url.pathname === "/Spanish-Web-App/"
    || url.pathname === "/Spanish-Web-App"
    || url.pathname.endsWith(".html");

  if (isDoc) {
    // Always fetch HTML fresh — forces iOS PWA to get new sentences immediately
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Other assets: network-first with cache fallback
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});