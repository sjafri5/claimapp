import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const SESSION_COOKIE = "claim_session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Create a signed session token for a user.
 * Format: userId.timestamp.signature
 */
export function createSessionToken(userId: string): string {
  const timestamp = Date.now().toString(36);
  const payload = `${userId}.${timestamp}`;
  const secret = process.env.CRON_SECRET || "dev-secret";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  return `${payload}.${signature}`;
}

/**
 * Verify and extract userId from a session token.
 */
export function verifySessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, timestamp, signature] = parts;
  const payload = `${userId}.${timestamp}`;
  const secret = process.env.CRON_SECRET || "dev-secret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .slice(0, 16);

  if (signature !== expected) return null;

  // Check expiry (30 days)
  const ts = parseInt(timestamp, 36);
  if (Date.now() - ts > SESSION_MAX_AGE * 1000) return null;

  return userId;
}

/**
 * Set the session cookie.
 */
export async function setSessionCookie(userId: string) {
  const token = createSessionToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Get the current user from the session cookie.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = verifySessionToken(token);
  if (!userId) return null;

  // In dry run without a real DB, return a stub user
  if (process.env.DRY_RUN === "true" && !process.env.DATABASE_URL?.includes("@")) {
    return {
      id: userId,
      email: "demo@claim.app",
      timezone: "America/Chicago",
      anniversaryCsr: null,
      anniversaryUnited: null,
      consentAt: new Date(),
      status: "active" as const,
      plan: "free" as const,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
    };
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user ?? null;
}

/**
 * Check if current user is an admin (matches ADMIN_EMAIL env).
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.email === process.env.ADMIN_EMAIL;
}
