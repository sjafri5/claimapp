import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        await db
          .update(users)
          .set({
            plan: "pro",
            stripeSubscriptionId: session.subscription as string,
          })
          .where(eq(users.id, userId));
        logger.info("User upgraded to Pro", { userId });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;

      if (sub.status === "active") {
        await db
          .update(users)
          .set({ plan: "pro", stripeSubscriptionId: sub.id })
          .where(eq(users.stripeCustomerId, customerId));
      } else if (
        sub.status === "canceled" ||
        sub.status === "unpaid" ||
        sub.status === "past_due"
      ) {
        await db
          .update(users)
          .set({ plan: "free", stripeSubscriptionId: null })
          .where(eq(users.stripeCustomerId, customerId));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await db
        .update(users)
        .set({ plan: "free", stripeSubscriptionId: null })
        .where(eq(users.stripeCustomerId, customerId));
      logger.info("Subscription deleted", { customerId });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
