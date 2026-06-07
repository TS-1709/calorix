// Calorix service worker — v6 (network-first for app shell, cache fallback)
//
// Strategy: the previous version (v5) used cache-first for the entire app
// shell, including JS bundles, which meant a stale bundle could be served
// for the full cache lifetime after a deploy. v6 flips the strategy:
//
//   - HTML: network-first (always check for the latest index.html)
//   - JS/CSS assets: network-first (new deploys get new hashes anyway)
//   - /icons/* and /manifest.webmanifest: cache-first (rarely change)
//   - everything else: network-first with cache fallback for offline
//
// This guarantees that after `npm run build && systemctl restart calorix`,
// the user always gets the latest bundle on the next page load (modulo CF
// edge cache, which we cannot control here).

const CACHE = 'calorix-v6';
const PRECACHE = ['/icons/icon-192.svg', '/icons/icon-512.svg', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  // Icons and manifest: cache-first (immutable in practice).
  if (url.pathname.startsWith('/icons/') || url.pathname === '/manifest.webmanifest') {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }))
    );
    return;
  }

  // Everything else (HTML, JS, CSS, etc): network-first, cache fallback.
  e.respondWith(
    fetch(e.request).then((res) => {
      // Only cache successful, same-origin, GET responses.
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => {
      // Offline fallback: serve from cache.
      return caches.match(e.request).then((cached) => {
        if (cached) return cached;
        // Last-resort: serve the cached index.html so the SPA shell loads.
        if (e.request.mode === 'navigate') return caches.match('/');
        return new Response('offline', { status: 503, statusText: 'offline' });
      });
    })
  );
});
