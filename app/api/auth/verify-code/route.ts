import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkVerificationCode } from "@/lib/email/verification";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { setSessionCookie } from "@/lib/auth/session";
import crypto from "crypto";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits"),
  timezone: z.string().default("America/New_York"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, timezone } = schema.parse(body);

    const isValid = await checkVerificationCode(email, code);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // In dry run without a DB, create a fake session
    if (process.env.DRY_RUN === "true" && !process.env.DATABASE_URL?.includes("@")) {
      const fakeId = crypto.randomUUID();
      await setSessionCookie(fakeId);
      return NextResponse.json({
        success: true,
        userId: fakeId,
        isNew: true,
      });
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
    console.error("verify-code error:", err);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
