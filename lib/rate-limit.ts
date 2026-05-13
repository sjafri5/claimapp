/**
 * Simple in-memory rate limiter.
 *
 * Uses a Map keyed by IP (or any identifier) to track request timestamps
 * within a sliding window. Expired entries are cleaned up periodically.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
const CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupRunning(windowMs: number) {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      entry.timestamps = entry.timestamps.filter((t: number) => now - t < windowMs);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    });
  }, CLEANUP_INTERVAL_MS);
  // Allow the Node.js process to exit even if the timer is still running
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

interface RateLimitOptions {
  /** Time window in milliseconds (default: 60 000 = 60 seconds) */
  windowMs?: number;
  /** Maximum requests allowed in the window (default: 5) */
  max?: number;
}

interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** How many requests remain in the current window */
  remaining: number;
}

export function rateLimit(
  ip: string,
  options?: RateLimitOptions
): RateLimitResult {
  const windowMs = options?.windowMs ?? 60_000;
  const max = options?.max ?? 5;
  const now = Date.now();

  ensureCleanupRunning(windowMs);

  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t: number) => now - t < windowMs);

  if (entry.timestamps.length >= max) {
    return { success: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  return { success: true, remaining: max - entry.timestamps.length };
}
