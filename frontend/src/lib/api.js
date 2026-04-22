import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
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
