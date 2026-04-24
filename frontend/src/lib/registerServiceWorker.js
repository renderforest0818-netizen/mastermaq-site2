/**
 * Registers the Mastermaq service worker with automatic update flow.
 * - Checks for updates on page load + every 30 minutes
 * - When a new SW is installed and waiting, activates it via SKIP_WAITING
 * - On controller change -> one-shot reload (no loop)
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  // Only register in production-like environments (https or localhost)
  const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
  if (!isSecure) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      // If a waiting SW exists at registration time -> activate now
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });

      // When a new worker is found updating -> auto-activate once installed
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            nw.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      // Check for updates periodically
      setInterval(() => { reg.update().catch(() => {}); }, 30 * 60 * 1000);
      // Also check when tab regains focus
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    } catch (e) {
      // Silently fail — app continues to work without SW
    }

    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  });
}
