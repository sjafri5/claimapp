import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { creditClaims } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

const schema = z.object({
  creditId: z.string().uuid(),
  cycleKey: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { creditId, cycleKey } = schema.parse(body);

    await db
      .insert(creditClaims)
      .values({
        userId: user.id,
        creditId,
        cycleKey,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to mark credit as done" },
      { status: 500 }
    );
  }
}
