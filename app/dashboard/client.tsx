"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UpcomingCredit } from "./page";

export function DashboardClient({
  credits,
  plan,
  hasSubscription,
}: {
  credits: UpcomingCredit[];
  plan: string;
  hasSubscription: boolean;
}) {
  const router = useRouter();
  const [claiming, setClaiming] = useState<string | null>(null);

  async function markDone(creditId: string, cycleKey: string) {
    setClaiming(creditId);
    try {
      await fetch("/api/credits/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditId, cycleKey }),
      });
      router.refresh();
    } catch {
      // ignore
    } finally {
      setClaiming(null);
    }
  }

  async function manageSubscription() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <>
      <div className="mt-6 space-y-3">
        {credits.map((item) => (
          <div
            key={`${item.creditId}-${item.cycleKey}`}
            className={`rounded-xl border p-4 ${
              item.isClaimed
                ? "border-green-200 bg-green-50"
                : item.daysUntil <= 7
                  ? "border-red-200 bg-red-50"
                  : item.daysUntil <= 30
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {item.creditName}
                </h3>
                <p className="text-sm text-gray-600">{item.cardName}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ${item.amountDollars}
                </div>
                <div
                  className={`text-sm ${
                    item.daysUntil <= 7
                      ? "font-semibold text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {item.isClaimed
                    ? "Claimed"
                    : item.daysUntil === 0
                      ? "Expires today!"
                      : item.daysUntil < 0
                        ? "Expired"
                        : `${item.daysUntil} days left`}
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Expires {item.deadline}
                {item.monthReminderSent && " · 30-day reminder sent"}
                {item.weekReminderSent && " · 7-day reminder sent"}
              </span>

              {!item.isClaimed && (
                <button
                  onClick={() => markDone(item.creditId, item.cycleKey)}
                  disabled={claiming === item.creditId}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {claiming === item.creditId ? "..." : "Mark as done"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Subscription management */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        {plan === "pro" && hasSubscription ? (
          <button
            onClick={manageSubscription}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Manage subscription
          </button>
        ) : plan !== "pro" ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
            <p className="text-sm text-yellow-800">
              You&apos;re on the free plan (1 card, no monthly reminders).
            </p>
            <a
              href="/upgrade"
              className="mt-2 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Upgrade to Pro — $10/year
            </a>
          </div>
        ) : null}
      </div>
    </>
  );
}
