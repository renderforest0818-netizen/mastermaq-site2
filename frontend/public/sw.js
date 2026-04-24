/* Mastermaq Service Worker
 * Strategy:
 *  - Docs (HTML): Network-First with fallback to cache / offline
 *  - Static assets (js/css/images): Stale-While-Revalidate
 *  - API requests: bypass (always fresh from network)
 *  - Version-based cache with skipWaiting + clients.claim for instant updates
 */
const VERSION = 'mm-v6';
const RUNTIME = `mm-runtime-${VERSION}`;
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(RUNTIME).then((cache) => cache.addAll([
      '/',
      '/manifest.json',
      '/icons/icon-192.png',
      '/icons/icon-512.png',
    ]).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== RUNTIME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isDoc(req) {
  return req.mode === 'navigate' || (req.destination === 'document');
}
function isStatic(req) {
  return ['style', 'script', 'worker', 'font', 'image'].includes(req.destination);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Skip cross-origin non-ours
  if (url.origin !== self.location.origin) return;
  // Never cache API or streams
  if (url.pathname.startsWith('/api/')) return;

  if (isDoc(req)) {
    // Network-first for documents, fallback to cached '/'
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(RUNTIME);
        cache.put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch {
        const cache = await caches.open(RUNTIME);
        return (await cache.match(req)) || (await cache.match(OFFLINE_URL));
      }
    })());
    return;
  }

  if (isStatic(req)) {
    // Stale-while-revalidate for static assets
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((res) => {
        if (res && res.status === 200) cache.put(req, res.clone()).catch(() => {});
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })());
  }
});
