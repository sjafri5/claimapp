import type { Credit } from "@/lib/db/schema";

/**
 * Compute the deterministic cycle key for a credit in a given year/period.
 * Examples:
 *   csr-stubhub-2026-h1
 *   csr-hotels-250-2026
 *   csr-travel-300-2026
 *   csr-doordash-2026-01
 */
export function computeCycleKey(
  credit: Credit,
  year: number,
  month?: number
): string {
  const cardPrefix = credit.cardId;
  const namePart = credit.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);

  switch (credit.frequency) {
    case "biannual_h1":
      return `${cardPrefix}-${namePart}-${year}-h1`;
    case "biannual_h2":
      return `${cardPrefix}-${namePart}-${year}-h2`;
    case "monthly":
      return `${cardPrefix}-${namePart}-${year}-${String(month ?? 1).padStart(2, "0")}`;
    case "one_time":
      return `${cardPrefix}-${namePart}-${year}`;
    case "annual":
      return `${cardPrefix}-${namePart}-${year}`;
    default:
      return `${cardPrefix}-${namePart}-${year}`;
  }
}

/**
 * Compute the next deadline date for a credit relative to today.
 * Returns null if the credit is not applicable (e.g., anniversary-based but no anniversary set).
 */
export function computeNextDeadline(
  credit: Credit,
  today: Date,
  anniversaryDate?: string | null
): Date | null {
  const year = today.getFullYear();

  if (credit.deadlineType === "anniversary") {
    if (!anniversaryDate) return null;
    const anniv = new Date(anniversaryDate + "T00:00:00");
    const annivMonth = anniv.getMonth();
    const annivDay = anniv.getDate();

    // Next anniversary is this year or next
    let deadline = new Date(year, annivMonth, annivDay);
    if (deadline < today) {
      deadline = new Date(year + 1, annivMonth, annivDay);
    }
    return deadline;
  }

  if (credit.deadlineType === "rolling_monthly") {
    // End of current month
    const month = today.getMonth();
    const endOfMonth = new Date(year, month + 1, 0); // day 0 of next month = last day of current
    if (endOfMonth >= today) {
      return endOfMonth;
    }
    // Already past end of month (shouldn't happen since today <= endOfMonth always)
    return new Date(year, month + 2, 0);
  }

  if (credit.deadlineType === "calendar") {
    if (credit.deadlineMonth === null || credit.deadlineDay === null)
      return null;

    // Calendar deadline this year
    const deadline = new Date(
      year,
      credit.deadlineMonth - 1,
      credit.deadlineDay
    );
    if (deadline >= today) {
      return deadline;
    }
    // If past, next year
    return new Date(year + 1, credit.deadlineMonth - 1, credit.deadlineDay);
  }

  return null;
}

/**
 * Get the year and optional month for computing the cycle key from a deadline date.
 */
export function getCycleParams(
  credit: Credit,
  deadlineDate: Date
): { year: number; month?: number } {
  const year = deadlineDate.getFullYear();
  if (credit.frequency === "monthly") {
    return { year, month: deadlineDate.getMonth() + 1 };
  }
  return { year };
}
