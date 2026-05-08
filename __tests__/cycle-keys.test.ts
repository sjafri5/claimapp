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

describe("computeCycleKey", () => {
  it("generates correct key for biannual H1 credit", () => {
    const credit = makeCredit({
      name: "StubHub / viagogo credit (H1)",
      frequency: "biannual_h1",
    });
    expect(computeCycleKey(credit, 2026)).toBe(
      "csr-stubhub-viagogo-credit-h1-2026-h1"
    );
  });

  it("generates correct key for biannual H2 credit", () => {
    const credit = makeCredit({
      name: "StubHub / viagogo credit (H2)",
      frequency: "biannual_h2",
    });
    expect(computeCycleKey(credit, 2026)).toBe(
      "csr-stubhub-viagogo-credit-h2-2026-h2"
    );
  });

  it("generates correct key for one-time credit", () => {
    const credit = makeCredit({
      name: "Select Hotels credit",
      frequency: "one_time",
      expiresAfterYear: 2026,
    });
    expect(computeCycleKey(credit, 2026)).toBe(
      "csr-select-hotels-credit-2026"
    );
  });

  it("generates correct key for monthly credit", () => {
    const credit = makeCredit({
      name: "DoorDash restaurant promo",
      frequency: "monthly",
      deadlineType: "rolling_monthly",
    });
    expect(computeCycleKey(credit, 2026, 3)).toBe(
      "csr-doordash-restaurant-promo-2026-03"
    );
  });

  it("generates correct key for annual credit", () => {
    const credit = makeCredit({
      name: "Travel credit",
      frequency: "annual",
      deadlineType: "anniversary",
    });
    expect(computeCycleKey(credit, 2026)).toBe("csr-travel-credit-2026");
  });

  it("pads monthly cycle key with leading zero", () => {
    const credit = makeCredit({
      name: "Test",
      frequency: "monthly",
    });
    expect(computeCycleKey(credit, 2026, 1)).toBe("csr-test-2026-01");
    expect(computeCycleKey(credit, 2026, 12)).toBe("csr-test-2026-12");
  });
});

describe("computeNextDeadline", () => {
  it("returns calendar deadline in current year if not yet passed", () => {
    const credit = makeCredit({
      deadlineType: "calendar",
      deadlineMonth: 6,
      deadlineDay: 30,
    });
    const today = new Date("2026-03-15T00:00:00");
    const deadline = computeNextDeadline(credit, today);

    expect(deadline).toEqual(new Date(2026, 5, 30)); // June 30, 2026
  });

  it("rolls to next year if calendar deadline has passed", () => {
    const credit = makeCredit({
      deadlineType: "calendar",
      deadlineMonth: 6,
      deadlineDay: 30,
    });
    const today = new Date("2026-07-15T00:00:00");
    const deadline = computeNextDeadline(credit, today);

    expect(deadline).toEqual(new Date(2027, 5, 30)); // June 30, 2027
  });

  it("returns anniversary date in current year if not yet passed", () => {
    const credit = makeCredit({
      deadlineType: "anniversary",
      deadlineMonth: null,
      deadlineDay: null,
    });
    const today = new Date("2026-03-15T00:00:00");
    const deadline = computeNextDeadline(credit, today, "2024-09-15");

    expect(deadline).toEqual(new Date(2026, 8, 15)); // Sep 15, 2026
  });

  it("rolls anniversary to next year if passed", () => {
    const credit = makeCredit({
      deadlineType: "anniversary",
      deadlineMonth: null,
      deadlineDay: null,
    });
    const today = new Date("2026-10-01T00:00:00");
    const deadline = computeNextDeadline(credit, today, "2024-09-15");

    expect(deadline).toEqual(new Date(2027, 8, 15)); // Sep 15, 2027
  });

  it("returns null for anniversary deadline with no anniversary date", () => {
    const credit = makeCredit({
      deadlineType: "anniversary",
    });
    const today = new Date("2026-03-15T00:00:00");
    const deadline = computeNextDeadline(credit, today, null);

    expect(deadline).toBeNull();
  });

  it("returns end of current month for rolling_monthly", () => {
    const credit = makeCredit({
      deadlineType: "rolling_monthly",
      deadlineMonth: null,
      deadlineDay: null,
    });
    const today = new Date("2026-02-15T00:00:00");
    const deadline = computeNextDeadline(credit, today);

    expect(deadline).toEqual(new Date(2026, 1, 28)); // Feb 28, 2026
  });

  it("handles end of month for months with 31 days", () => {
    const credit = makeCredit({
      deadlineType: "rolling_monthly",
      deadlineMonth: null,
      deadlineDay: null,
    });
    const today = new Date("2026-01-15T00:00:00");
    const deadline = computeNextDeadline(credit, today);

    expect(deadline).toEqual(new Date(2026, 0, 31)); // Jan 31, 2026
  });

  it("returns null for calendar deadline with missing month/day", () => {
    const credit = makeCredit({
      deadlineType: "calendar",
      deadlineMonth: null,
      deadlineDay: null,
    });
    const today = new Date("2026-03-15T00:00:00");
    const deadline = computeNextDeadline(credit, today);

    expect(deadline).toBeNull();
  });
});

describe("getCycleParams", () => {
  it("returns year and month for monthly credits", () => {
    const credit = makeCredit({ frequency: "monthly" });
    const deadline = new Date(2026, 2, 31); // March 31
    expect(getCycleParams(credit, deadline)).toEqual({
      year: 2026,
      month: 3,
    });
  });

  it("returns only year for non-monthly credits", () => {
    const credit = makeCredit({ frequency: "annual" });
    const deadline = new Date(2026, 11, 31); // Dec 31
    expect(getCycleParams(credit, deadline)).toEqual({ year: 2026 });
  });
});
