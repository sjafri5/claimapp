import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { credits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth/session";

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  amountCents: z.number().int().positive().optional(),
  description: z.string().optional(),
  activationUrl: z.string().nullable().optional(),
  deadlineMonth: z.number().int().min(1).max(12).nullable().optional(),
  deadlineDay: z.number().int().min(1).max(31).nullable().optional(),
  active: z.boolean().optional(),
  lowPriority: z.boolean().optional(),
});

const createSchema = z.object({
  cardId: z.string(),
  name: z.string(),
  amountCents: z.number().int().positive(),
  description: z.string(),
  activationUrl: z.string().nullable().optional(),
  deadlineType: z.enum(["calendar", "anniversary", "rolling_monthly"]),
  deadlineMonth: z.number().int().min(1).max(12).nullable().optional(),
  deadlineDay: z.number().int().min(1).max(31).nullable().optional(),
  frequency: z.enum([
    "one_time",
    "annual",
    "biannual_h1",
    "biannual_h2",
    "monthly",
  ]),
  expiresAfterYear: z.number().int().nullable().optional(),
  active: z.boolean().default(true),
  lowPriority: z.boolean().default(false),
});

export async function GET() {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allCredits = await db.select().from(credits);
  return NextResponse.json(allCredits);
}

export async function POST(req: NextRequest) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const [newCredit] = await db.insert(credits).values(data).returning();
    return NextResponse.json(newCredit, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create credit" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = updateSchema.parse(body);

    const [updated] = await db
      .update(credits)
      .set(data)
      .where(eq(credits.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Credit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update credit" },
      { status: 500 }
    );
  }
}
