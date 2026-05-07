/**
 * Registers the Mastermaq service worker with an aggressive auto-update flow.
 *
 * Strategy to guarantee that ALL clients pick up new deploys quickly:
 *   1. `updateViaCache: 'none'` — the browser must always revalidate /sw.js
 *      from the network (bypasses the default 24h HTTP cache on the SW itself).
 *      This is the #1 fix for "users stuck on old version after deploy".
 *   2. Immediate `reg.update()` on page load.
 *   3. Periodic `reg.update()` every 10 minutes while the tab is open.
 *   4. `reg.update()` whenever the tab regains focus.
 *   5. When a new SW is installed and waiting, immediately activate it.
 *   6. One-shot reload on `controllerchange` so the page reflects fresh assets.
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  // Only register in secure contexts (https or localhost) — required by the spec.
  const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
  if (!isSecure) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      // If a waiting SW exists at registration time -> activate now.
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });

      // When a new worker is found updating -> auto-activate once installed.
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            nw.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      // Eager update checks.
      reg.update().catch(() => {});
      setInterval(() => { reg.update().catch(() => {}); }, 10 * 60 * 1000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
      window.addEventListener('focus', () => { reg.update().catch(() => {}); });
    } catch (_e) {
      // Silently fail — app continues to work without SW.
    }

    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  });
}
