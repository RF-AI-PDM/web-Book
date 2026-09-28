// In-memory sliding-window rate limiter, keyed by client IP.
// Single-process only — fine for this app's scale. If this ever runs
// behind multiple instances, swap for a shared store (Redis, etc).

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 15;

const hits = new Map<string, number[]>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (hits.get(key) || []).filter(t => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000);
    hits.set(key, timestamps);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  hits.set(key, timestamps);

  // Periodic cleanup so the map doesn't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      const fresh = v.filter(t => t > windowStart);
      if (fresh.length === 0) hits.delete(k);
      else hits.set(k, fresh);
    }
  }

  return { allowed: true };
}
