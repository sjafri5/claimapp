import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  userCards,
  credits,
  creditClaims,
  remindersSent,
  cards,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  computeNextDeadline,
  computeCycleKey,
  getCycleParams,
} from "@/lib/reminders/cycle-keys";
import { Logo } from "@/components/ui";
import { DashboardClient } from "./client";
import { cardSeeds } from "@/lib/seeds/cards";
import { getAllSeedCredits } from "@/lib/seeds/all";
import type { Credit } from "@/lib/db/schema";

export interface UpcomingCredit {
  creditId: string;
  creditName: string;
  cardName: string;
  amountDollars: number;
  deadline: string;
  daysUntil: number;
  isClaimed: boolean;
  cycleKey: string;
  monthReminderSent: boolean;
  weekReminderSent: boolean;
}

const isDryRunNoDb =
  process.env.DRY_RUN === "true" &&
  !process.env.DATABASE_URL?.includes("@");

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signup");

  const today = new Date();
  const todayDate = new Date(
    today.toLocaleDateString("en-CA", { timeZone: user.timezone })
  );

  const upcoming: UpcomingCredit[] = [];

  if (isDryRunNoDb) {
    // Use seed data for demo — show all cards
    const demoCards = cardSeeds.map((c) => c.id);
    const allCredits = getAllSeedCredits();

    for (const credit of allCredits) {
      if (!demoCards.includes(credit.cardId)) continue;
      if (credit.lowPriority) continue;
      if (
        credit.expiresAfterYear &&
        todayDate.getFullYear() > credit.expiresAfterYear
      )
        continue;
      if (!credit.active) continue;

      const deadlineDate = computeNextDeadline(
        credit as Credit,
        todayDate,
        credit.deadlineType === "anniversary" ? "2026-05-12" : null
      );
      if (!deadlineDate) continue;

      const { year, month } = getCycleParams(credit as Credit, deadlineDate);
      const cycleKey = computeCycleKey(credit as Credit, year, month);
      const daysUntil = Math.ceil(
        (deadlineDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const card = cardSeeds.find((c) => c.id === credit.cardId);

      upcoming.push({
        creditId: credit.id,
        creditName: credit.name,
        cardName: card?.name ?? credit.cardId,
        amountDollars: credit.amountCents / 100,
        deadline: deadlineDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        daysUntil,
        isClaimed: false,
        cycleKey,
        monthReminderSent: false,
        weekReminderSent: false,
      });
    }
  } else {
    const userCardRows = await db
      .select({ cardId: userCards.cardId })
      .from(userCards)
      .where(eq(userCards.userId, user.id));

    for (const uc of userCardRows) {
      const cardCredits = await db
        .select()
        .from(credits)
        .where(and(eq(credits.cardId, uc.cardId), eq(credits.active, true)));

      const [card] = await db
        .select()
        .from(cards)
        .where(eq(cards.id, uc.cardId));

      for (const credit of cardCredits) {
        if (credit.lowPriority) continue;
        if (
          credit.expiresAfterYear &&
          todayDate.getFullYear() > credit.expiresAfterYear
        )
          continue;

        const anniversaryDate =
          uc.cardId === "csr"
            ? user.anniversaryCsr
            : uc.cardId === "united_club_infinite"
              ? user.anniversaryUnited
              : null;

        const deadlineDate = computeNextDeadline(
          credit,
          todayDate,
          anniversaryDate
        );

        if (!deadlineDate) continue;

        const { year, month } = getCycleParams(credit, deadlineDate);
        const cycleKey = computeCycleKey(credit, year, month);

        const daysUntil = Math.ceil(
          (deadlineDate.getTime() - todayDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const [claim] = await db
          .select()
          .from(creditClaims)
          .where(
            and(
              eq(creditClaims.userId, user.id),
              eq(creditClaims.creditId, credit.id),
              eq(creditClaims.cycleKey, cycleKey)
            )
          );

        const sentReminders = await db
          .select()
          .from(remindersSent)
          .where(
            and(
              eq(remindersSent.userId, user.id),
              eq(remindersSent.creditId, credit.id),
              eq(remindersSent.cycleKey, cycleKey)
            )
          );

        upcoming.push({
          creditId: credit.id,
          creditName: credit.name,
          cardName: card?.name ?? uc.cardId,
          amountDollars: credit.amountCents / 100,
          deadline: deadlineDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          daysUntil,
          isClaimed: !!claim,
          cycleKey,
          monthReminderSent: sentReminders.some(
            (r) => r.reminderType === "month_before"
          ),
          weekReminderSent: sentReminders.some(
            (r) => r.reminderType === "week_before"
          ),
        });
      }
    }
  }

  upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.email}</span>
          {user.plan === "pro" ? (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              Pro
            </span>
          ) : (
            <a
              href="/upgrade"
              className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700 hover:bg-yellow-200"
            >
              Free — Upgrade
            </a>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Your credits</h1>
      <p className="mt-1 text-gray-600">
        Upcoming credits across your cards. We&apos;ll email you before each
        deadline.
      </p>

      {upcoming.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
          No upcoming credits found. Make sure you&apos;ve selected your cards.
        </div>
      ) : (
        <DashboardClient
          credits={upcoming}
          plan={user.plan}
          hasSubscription={!!user.stripeSubscriptionId}
        />
      )}
    </div>
  );
}
