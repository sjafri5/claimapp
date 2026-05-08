import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.plan === "pro") {
    return NextResponse.json({ error: "Already on Pro" }, { status: 400 });
  }

  // Dry run: redirect straight to dashboard
  if (
    process.env.DRY_RUN === "true" &&
    !process.env.DATABASE_URL?.includes("@")
  ) {
    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    });
  }

  const stripe = getStripe();

  // Create or reuse Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, user.id));
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: session.url });
}
