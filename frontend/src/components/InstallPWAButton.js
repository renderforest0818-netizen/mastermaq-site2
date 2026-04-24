import { useEffect, useState, useCallback } from 'react';
import { Download } from 'lucide-react';

/**
 * Listens for `beforeinstallprompt`, lets the user trigger installation, and
 * hides itself once the app is installed (or when the browser cannot prompt).
 *
 * The button hides automatically when:
 *   - The app is already running as a PWA (standalone display mode)
 *   - The user accepts or dismisses the install prompt
 *   - The browser does not fire `beforeinstallprompt` (e.g., iOS Safari)
 */
export default function InstallPWAButton({ className = '', variant = 'desktop' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Detect if already installed (standalone display mode or iOS standalone).
    const inStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (inStandalone) setInstalled(true);

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice?.outcome === 'accepted') setInstalled(true);
    } catch {
      /* no-op */
    }
  }, [deferredPrompt]);

  if (installed || !deferredPrompt) return null;

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={handleInstall}
        className={`w-9 h-9 rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 flex items-center justify-center transition-colors ${className}`}
        aria-label="Instalar App"
        data-testid="install-pwa-btn-mobile"
      >
        <Download className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className={`inline-flex items-center gap-1.5 text-[13px] font-medium border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors px-3.5 h-9 rounded-md ${className}`}
      data-testid="install-pwa-btn"
    >
      <Download className="w-3.5 h-3.5" />
      Instalar App
    </button>
  );
}
