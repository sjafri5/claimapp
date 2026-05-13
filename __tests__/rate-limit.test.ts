import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

// Reset the internal store between tests by re-importing a fresh module
// We use vi.useFakeTimers to control time-based behavior.

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests under the limit", () => {
    const ip = "test-allow-" + Math.random();
    const result = rateLimit(ip, { windowMs: 60_000, max: 5 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests over the limit", () => {
    const ip = "test-block-" + Math.random();
    for (let i = 0; i < 5; i++) {
      const r = rateLimit(ip, { windowMs: 60_000, max: 5 });
      expect(r.success).toBe(true);
    }
    const blocked = rateLimit(ip, { windowMs: 60_000, max: 5 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after the window expires", () => {
    const ip = "test-reset-" + Math.random();
    for (let i = 0; i < 5; i++) {
      rateLimit(ip, { windowMs: 60_000, max: 5 });
    }
    expect(rateLimit(ip, { windowMs: 60_000, max: 5 }).success).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(60_001);

    const afterReset = rateLimit(ip, { windowMs: 60_000, max: 5 });
    expect(afterReset.success).toBe(true);
    expect(afterReset.remaining).toBe(4);
  });

  it("tracks different IPs independently", () => {
    const ip1 = "test-ip1-" + Math.random();
    const ip2 = "test-ip2-" + Math.random();
    for (let i = 0; i < 5; i++) {
      rateLimit(ip1, { windowMs: 60_000, max: 5 });
    }
    expect(rateLimit(ip1, { windowMs: 60_000, max: 5 }).success).toBe(false);
    expect(rateLimit(ip2, { windowMs: 60_000, max: 5 }).success).toBe(true);
  });

  it("uses default options when none provided", () => {
    const ip = "test-defaults-" + Math.random();
    // Default is 5 requests per 60s
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(ip).success).toBe(true);
    }
    expect(rateLimit(ip).success).toBe(false);
  });

  it("returns correct remaining count", () => {
    const ip = "test-remaining-" + Math.random();
    expect(rateLimit(ip, { max: 3, windowMs: 60_000 }).remaining).toBe(2);
    expect(rateLimit(ip, { max: 3, windowMs: 60_000 }).remaining).toBe(1);
    expect(rateLimit(ip, { max: 3, windowMs: 60_000 }).remaining).toBe(0);
    // blocked
    expect(rateLimit(ip, { max: 3, windowMs: 60_000 }).remaining).toBe(0);
  });

  it("supports stricter limits for verify endpoint pattern", () => {
    const ip = "verify:test-strict-" + Math.random();
    const opts = { windowMs: 15 * 60 * 1000, max: 10 };
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(ip, opts).success).toBe(true);
    }
    expect(rateLimit(ip, opts).success).toBe(false);

    // Still blocked after 14 minutes
    vi.advanceTimersByTime(14 * 60 * 1000);
    expect(rateLimit(ip, opts).success).toBe(false);

    // Allowed after 15 minutes
    vi.advanceTimersByTime(1 * 60 * 1000 + 1);
    expect(rateLimit(ip, opts).success).toBe(true);
  });
});
