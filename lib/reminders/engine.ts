import { db } from "@/lib/db";
import {
  users,
  userCards,
  credits,
  creditClaims,
  remindersSent,
  cards,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/email/send";
import {
  monthBeforeSubject,
  monthBeforeBody,
  weekBeforeSubject,
  weekBeforeBody,
  formatDeadline,
} from "@/lib/email/templates";
import {
  computeNextDeadline,
  computeCycleKey,
  getCycleParams,
} from "./cycle-keys";

export interface ReminderResult {
  sent: number;
  skipped: number;
  errors: string[];
}

/**
 * Run the reminder engine for a given date (defaults to now).
 */
export async function runReminderEngine(
  todayOverride?: Date
): Promise<ReminderResult> {
  const result: ReminderResult = { sent: 0, skipped: 0, errors: [] };
  const now = todayOverride ?? new Date();

  const activeUsers = await db
    .select()
    .from(users)
    .where(eq(users.status, "active"));

  for (const user of activeUsers) {
    const userToday = getDateInTimezone(now, user.timezone);

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
        if (credit.lowPriority) {
          result.skipped++;
          continue;
        }

        // Free users only get non-monthly reminders
        if (credit.frequency === "monthly" && user.plan !== "pro") {
          result.skipped++;
          continue;
        }

        if (
          credit.expiresAfterYear &&
          userToday.getFullYear() > credit.expiresAfterYear
        ) {
          result.skipped++;
          continue;
        }

        const anniversaryDate =
          uc.cardId === "csr"
            ? user.anniversaryCsr
            : uc.cardId === "united_club_infinite"
              ? user.anniversaryUnited
              : null;

        const deadlineDate = computeNextDeadline(
          credit,
          userToday,
          anniversaryDate
        );

        if (!deadlineDate) {
          result.skipped++;
          continue;
        }

        const { year, month } = getCycleParams(credit, deadlineDate);
        const cycleKey = computeCycleKey(credit, year, month);

        const [existingClaim] = await db
          .select()
          .from(creditClaims)
          .where(
            and(
              eq(creditClaims.userId, user.id),
              eq(creditClaims.creditId, credit.id),
              eq(creditClaims.cycleKey, cycleKey)
            )
          );

        if (existingClaim) {
          result.skipped++;
          continue;
        }

        const daysUntil = Math.ceil(
          (deadlineDate.getTime() - userToday.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysUntil < 0 || daysUntil > 30) {
          result.skipped++;
          continue;
        }

        const amountDollars = credit.amountCents / 100;
        const deadlineStr = formatDeadline(deadlineDate);
        const cardName = card?.name ?? uc.cardId;

        try {
          if (daysUntil === 30) {
            const subject = monthBeforeSubject(credit.name, amountDollars);
            const { text, html } = monthBeforeBody(
              credit.name,
              cardName,
              deadlineStr,
              amountDollars
            );
            await trySendReminder(
              user.id,
              user.email,
              credit.id,
              cycleKey,
              "month_before",
              subject,
              text,
              html,
              result
            );
          }

          if (daysUntil === 7) {
            const subject = weekBeforeSubject(credit.name, amountDollars);
            const { text, html } = weekBeforeBody(
              credit.name,
              cardName,
              deadlineStr,
              amountDollars
            );
            await trySendReminder(
              user.id,
              user.email,
              credit.id,
              cycleKey,
              "week_before",
              subject,
              text,
              html,
              result
            );
          }
        } catch (err) {
          result.errors.push(
            `Error for user ${user.id}, credit ${credit.id}: ${err}`
          );
        }
      }
    }
  }

  return result;
}

async function trySendReminder(
  userId: string,
  email: string,
  creditId: string,
  cycleKey: string,
  reminderType: "month_before" | "week_before",
  subject: string,
  text: string,
  html: string,
  result: ReminderResult
) {
  const [existing] = await db
    .select()
    .from(remindersSent)
    .where(
      and(
        eq(remindersSent.userId, userId),
        eq(remindersSent.creditId, creditId),
        eq(remindersSent.cycleKey, cycleKey),
        eq(remindersSent.reminderType, reminderType)
      )
    );

  if (existing) {
    result.skipped++;
    return;
  }

  const emailResult = await sendEmail(email, subject, text, html);

  await db.insert(remindersSent).values({
    userId,
    creditId,
    cycleKey,
    reminderType,
    messageId: emailResult?.messageId ?? null,
  });

  result.sent++;
}

function getDateInTimezone(now: Date, timezone: string): Date {
  const dateStr = now.toLocaleDateString("en-CA", { timeZone: timezone });
  return new Date(dateStr + "T00:00:00");
}
