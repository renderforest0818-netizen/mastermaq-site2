import axios from 'axios';

/**
 * Resolve the backend base URL.
 *
 * In production (any non-localhost host) we use `window.location.origin` so
 * that API requests are SAME-ORIGIN with the page. This avoids cross-origin
 * CORS issues with credentialed requests (cookies), which are critical for
 * the Mastermaq auth flow. The Emergent platform routes `/api/*` on the
 * custom domain to the same backend, so this works for any domain the user
 * connects (eletro-master.emergent.host, mastermaqassistencia.com, www., etc).
 *
 * In local development (localhost:3000) we fall back to REACT_APP_BACKEND_URL
 * so the dev server talks to the local FastAPI.
 */
export function resolveBackendUrl() {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (!isLocal) return window.location.origin;
  }
  return process.env.REACT_APP_BACKEND_URL || '';
}

export const BACKEND_URL = resolveBackendUrl();

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-refresh access token on 401 (excluding the auth endpoints themselves)
let refreshPromise = null;
const isAuthEndpoint = (url = '') =>
  url.includes('/auth/login') ||
  url.includes('/auth/register') ||
  url.includes('/auth/refresh') ||
  url.includes('/auth/logout');

API.interceptors.response.use(
  (r) => r,
  async (error) => {
    const { config, response } = error;
    if (!response || response.status !== 401 || !config || config._retry || isAuthEndpoint(config.url || '')) {
      return Promise.reject(error);
    }
    config._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = API.post('/auth/refresh').finally(() => { refreshPromise = null; });
      }
      await refreshPromise;
      return API(config);
    } catch (e) {
      return Promise.reject(error);
    }
  }
);

export function formatApiError(detail) {
  if (detail == null) return "Algo deu errado. Tente novamente.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default API;
