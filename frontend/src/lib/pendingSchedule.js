/**
 * Persists a "scheduling intent" across the login/register redirect so that,
 * after authenticating, we can re-open the scheduling modal pre-filled with
 * whatever the visitor chose before being asked to log in.
 *
 * Scope: equipment clicked in Home/ServicesPage, plus the pre-filled data
 * collected by the Mi chat (equipment, brand, defect hint).
 *
 * Intents expire after 1 hour to avoid resurrecting stale selections.
 */
const KEY = 'mastermaq_pending_schedule_v1';
const TTL_MS = 60 * 60 * 1000; // 1h

export function savePendingSchedule(payload) {
  try {
    const value = { ...payload, savedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch { /* quota / private mode */ }
}

export function readPendingSchedule() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (!v?.savedAt || Date.now() - v.savedAt > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return v;
  } catch {
    return null;
  }
}

export function clearPendingSchedule() {
  try { localStorage.removeItem(KEY); } catch { /* */ }
}
