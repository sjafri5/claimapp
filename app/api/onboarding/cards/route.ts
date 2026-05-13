import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { userCards, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

const schema = z.object({
  cardIds: z.array(z.string()).min(1, "Select at least one card"),
  anniversaryCsr: z.string().nullable().optional(),
  anniversaryUnited: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { cardIds, anniversaryCsr, anniversaryUnited } = schema.parse(body);

    // Enforce card limit for free users (admins bypass)
    const isAdmin = user.email === process.env.ADMIN_EMAIL;
    if (user.plan !== "pro" && !isAdmin && cardIds.length > 1) {
      return NextResponse.json(
        { error: "Free plan allows 1 card. Upgrade to Pro for unlimited cards.", upgrade: true },
        { status: 403 }
      );
    }

    // Delete existing cards and re-insert
    await db.delete(userCards).where(eq(userCards.userId, user.id));

    for (const cardId of cardIds) {
      await db.insert(userCards).values({
        userId: user.id,
        cardId,
      });
    }

    // Update anniversary dates
    const updateData: Record<string, string | null> = {};
    if (cardIds.includes("csr") && anniversaryCsr) {
      updateData.anniversaryCsr = anniversaryCsr;
    }
    if (cardIds.includes("united_club_infinite") && anniversaryUnited) {
      updateData.anniversaryUnited = anniversaryUnited;
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(users).set(updateData).where(eq(users.id, user.id));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }
    logger.error("onboarding cards error", err);
    return NextResponse.json(
      { error: "Failed to save cards" },
      { status: 500 }
    );
  }
}
