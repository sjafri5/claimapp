import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

describe("session tokens", () => {
  const TEST_SECRET = "test-session-secret-for-testing";

  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", TEST_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates a valid token with userId.timestamp.signature format", () => {
    const token = createSessionToken("user-123");
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("user-123");
  });

  it("verifies a valid token and returns the userId", () => {
    const token = createSessionToken("user-456");
    const userId = verifySessionToken(token);
    expect(userId).toBe("user-456");
  });

  it("rejects a token with a tampered signature", () => {
    const token = createSessionToken("user-789");
    const parts = token.split(".");
    parts[2] = "0000000000000000";
    const tampered = parts.join(".");
    const userId = verifySessionToken(tampered);
    expect(userId).toBeNull();
  });

  it("rejects a token with wrong number of parts", () => {
    expect(verifySessionToken("only-two.parts")).toBeNull();
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("a.b.c.d")).toBeNull();
  });

  it("rejects an expired token", () => {
    // Create a token, then advance time past 30 days
    const token = createSessionToken("user-expired");
    const parts = token.split(".");
    // Set timestamp to 31 days ago
    const oldTimestamp = (Date.now() - 31 * 24 * 60 * 60 * 1000).toString(36);
    const payload = `user-expired.${oldTimestamp}`;
    const crypto = require("crypto");
    const signature = crypto
      .createHmac("sha256", TEST_SECRET)
      .update(payload)
      .digest("hex")
      .slice(0, 16);
    const expiredToken = `${payload}.${signature}`;

    const userId = verifySessionToken(expiredToken);
    expect(userId).toBeNull();
  });

  it("throws when SESSION_SECRET is not set", () => {
    vi.stubEnv("SESSION_SECRET", "");
    // The function checks for truthiness, so empty string triggers the error
    expect(() => createSessionToken("user-123")).toThrow("SESSION_SECRET");
  });

  it("returns null when verifying without SESSION_SECRET", () => {
    const token = createSessionToken("user-123");
    vi.stubEnv("SESSION_SECRET", "");
    const result = verifySessionToken(token);
    expect(result).toBeNull();
  });
});
