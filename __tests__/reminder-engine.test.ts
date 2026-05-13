import { describe, it, expect } from "vitest";
import {
  computeCycleKey,
  computeNextDeadline,
  getCycleParams,
} from "@/lib/reminders/cycle-keys";
import type { Credit } from "@/lib/db/schema";

function makeCredit(overrides: Partial<Credit>): Credit {
  return {
    id: "test-id",
    cardId: "csr",
    name: "Test Credit",
    amountCents: 10000,
    description: "Test",
    activationUrl: null,
    deadlineType: "calendar",
    deadlineMonth: 12,
    deadlineDay: 31,
    frequency: "annual",
    expiresAfterYear: null,
    active: true,
    lowPriority: false,
    ...overrides,
  };
}

describe("reminder engine edge cases", () => {
  describe("cycle key uniqueness", () => {
    it("generates different keys for different cards with same credit name", () => {
      const credit1 = makeCredit({ cardId: "csr", name: "Travel Credit" });
      const credit2 = makeCredit({ cardId: "amex_platinum", name: "Travel Credit" });
      expect(computeCycleKey(credit1, 2026)).not.toBe(computeCycleKey(credit2, 2026));
    });

    it("generates different keys for different years", () => {
      const credit = makeCredit({ name: "Travel Credit" });
      expect(computeCycleKey(credit, 2026)).not.toBe(computeCycleKey(credit, 2027));
    });

    it("generates different keys for H1 vs H2", () => {
      const h1 = makeCredit({ name: "Credit", frequency: "biannual_h1" });
      const h2 = makeCredit({ name: "Credit", frequency: "biannual_h2" });
      expect(computeCycleKey(h1, 2026)).not.toBe(computeCycleKey(h2, 2026));
    });
  });

  describe("deadline computation edge cases", () => {
    it("handles leap year for rolling monthly in February", () => {
      const credit = makeCredit({
        deadlineType: "rolling_monthly",
        deadlineMonth: null,
        deadlineDay: null,
      });
      // 2028 is a leap year
      const today = new Date("2028-02-15T00:00:00");
      const deadline = computeNextDeadline(credit, today);
      expect(deadline).toEqual(new Date(2028, 1, 29)); // Feb 29, 2028
    });

    it("handles deadline on today (should include today)", () => {
      const credit = makeCredit({
        deadlineType: "calendar",
        deadlineMonth: 6,
        deadlineDay: 15,
      });
      const today = new Date("2026-06-15T00:00:00");
      const deadline = computeNextDeadline(credit, today);
      expect(deadline).toEqual(new Date(2026, 5, 15)); // Same day
    });

    it("handles Dec 31 deadline correctly on Jan 1", () => {
      const credit = makeCredit({
        deadlineType: "calendar",
        deadlineMonth: 12,
        deadlineDay: 31,
      });
      const today = new Date("2026-01-01T00:00:00");
      const deadline = computeNextDeadline(credit, today);
      expect(deadline).toEqual(new Date(2026, 11, 31));
    });

    it("handles anniversary with various date formats", () => {
      const credit = makeCredit({
        deadlineType: "anniversary",
        deadlineMonth: null,
        deadlineDay: null,
      });
      const today = new Date("2026-03-15T00:00:00");

      // Standard format
      const deadline = computeNextDeadline(credit, today, "2023-07-20");
      expect(deadline).toEqual(new Date(2026, 6, 20));
    });
  });

  describe("getCycleParams", () => {
    it("returns correct month for December deadline", () => {
      const credit = makeCredit({ frequency: "monthly" });
      const deadline = new Date(2026, 11, 31); // December 31
      expect(getCycleParams(credit, deadline)).toEqual({ year: 2026, month: 12 });
    });

    it("returns correct month for January deadline", () => {
      const credit = makeCredit({ frequency: "monthly" });
      const deadline = new Date(2026, 0, 31); // January 31
      expect(getCycleParams(credit, deadline)).toEqual({ year: 2026, month: 1 });
    });
  });
});
