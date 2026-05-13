"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UpcomingCredit } from "./page";

const T = {
  card: "#fffbf0",
  ink: "#3a342b",
  inkSoft: "#6b5f4d",
  sage: "#9bb08a",
  sageD: "#6f8a5e",
  rose: "#c98a8a",
  ochre: "#d4a83c",
  rule: "#b8a784",
};

function getBorderColor(item: UpcomingCredit) {
  if (item.isClaimed) return T.sage;
  if (item.daysUntil <= 7) return T.rose;
  if (item.daysUntil <= 30) return T.ochre;
  return T.rule;
}

function getBgColor(item: UpcomingCredit) {
  if (item.isClaimed) return "rgba(155,176,138,.1)";
  if (item.daysUntil <= 7) return "rgba(201,138,138,.08)";
  if (item.daysUntil <= 30) return "rgba(212,168,60,.06)";
  return T.card;
}

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
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {credits.map((item) => (
          <div
            key={`${item.creditId}-${item.cycleKey}`}
            style={{
              border: `1px solid ${getBorderColor(item)}`,
              background: getBgColor(item),
              padding: 16,
              borderRadius: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 600,
                    fontSize: 17,
                    color: T.ink,
                    margin: 0,
                  }}
                >
                  {item.creditName}
                </h3>
                <p
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 15,
                    color: T.inkSoft,
                    margin: "2px 0 0",
                  }}
                >
                  {item.cardName}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 600,
                    fontSize: 20,
                    color: T.ink,
                  }}
                >
                  ${item.amountDollars}
                </div>
                <div
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 15,
                    color: item.isClaimed
                      ? T.sageD
                      : item.daysUntil <= 7
                        ? T.rose
                        : T.inkSoft,
                    fontWeight: item.daysUntil <= 7 && !item.isClaimed ? 600 : 400,
                  }}
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

            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 13,
                  color: T.inkSoft,
                }}
              >
                Expires {item.deadline}
                {item.monthReminderSent && " \u00b7 30-day reminder sent"}
                {item.weekReminderSent && " \u00b7 7-day reminder sent"}
              </span>

              {!item.isClaimed && (
                <span
                  style={{
                    display: "inline-block",
                    border: `1px solid ${T.ink}`,
                    padding: 4,
                    lineHeight: 1,
                    cursor: claiming === item.creditId ? "not-allowed" : "pointer",
                    opacity: claiming === item.creditId ? 0.5 : 1,
                  }}
                >
                  <button
                    onClick={() => markDone(item.creditId, item.cycleKey)}
                    disabled={claiming === item.creditId}
                    style={{
                      display: "inline-block",
                      background: T.ink,
                      color: T.card,
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontWeight: 600,
                      fontSize: 11,
                      padding: "6px 14px",
                      borderRadius: 0,
                      border: "none",
                      cursor: claiming === item.creditId ? "not-allowed" : "pointer",
                    }}
                  >
                    {claiming === item.creditId ? "..." : "Mark as done"}
                  </button>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Subscription management */}
      <div
        style={{
          marginTop: 32,
          borderTop: `1px solid ${T.rule}`,
          paddingTop: 24,
        }}
      >
        {plan === "pro" && hasSubscription ? (
          <button
            onClick={manageSubscription}
            style={{
              background: "none",
              border: "none",
              fontFamily: "'Caveat', cursive",
              fontSize: 15,
              color: T.inkSoft,
              cursor: "pointer",
              textDecoration: "underline",
              textDecorationStyle: "wavy" as const,
              textDecorationColor: T.sage,
              padding: 0,
            }}
          >
            Manage subscription
          </button>
        ) : plan !== "pro" ? (
          <div
            style={{
              border: `1px solid ${T.ochre}`,
              background: "rgba(212,168,60,.06)",
              padding: 20,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 15,
                fontStyle: "italic",
                color: T.ink,
                margin: 0,
              }}
            >
              You&apos;re on the free plan (1 card, no monthly reminders).
            </p>
            <a
              href="/upgrade"
              style={{
                display: "inline-block",
                marginTop: 12,
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  border: `1px solid ${T.ink}`,
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    background: T.ink,
                    color: T.card,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "10px 24px",
                  }}
                >
                  Upgrade to Pro — $10/year
                </span>
              </span>
            </a>
          </div>
        ) : null}
      </div>
    </>
  );
}
