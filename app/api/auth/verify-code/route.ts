import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkVerificationCode } from "@/lib/email/verification";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { setSessionCookie } from "@/lib/auth/session";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits"),
  timezone: z.string().default("America/New_York"),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.ip ??
      "unknown";
    const { success } = rateLimit(`verify:${ip}`, {
      windowMs: 15 * 60 * 1000,
      max: 10,
    });
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, code, timezone } = schema.parse(body);

    const isValid = await checkVerificationCode(email, code);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // Upsert user
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (user) {
      await db
        .update(users)
        .set({
          status: "active",
          consentAt: new Date(),
          timezone,
        })
        .where(eq(users.id, user.id));
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          timezone,
          status: "active",
          consentAt: new Date(),
        })
        .returning();
      user = newUser;
    }

    await setSessionCookie(user.id);

    return NextResponse.json({
      success: true,
      userId: user.id,
      isNew: !user.createdAt || user.createdAt.getTime() > Date.now() - 5000,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }
    logger.error("verify-code error", err);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
