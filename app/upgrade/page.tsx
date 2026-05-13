"use client";

import { useState } from "react";
import { Button, PageContainer, Logo } from "@/components/ui";
import Link from "next/link";

const T = {
  paper: "#efe7d4",
  card: "#fffbf0",
  ink: "#3a342b",
  inkSoft: "#6b5f4d",
  sage: "#9bb08a",
  sageD: "#6f8a5e",
  rose: "#c98a8a",
  ochre: "#d4a83c",
  rule: "#b8a784",
};

function CheckIcon({ active = true }: { active?: boolean }) {
  return (
    <span
      style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 14,
        color: active ? T.sageD : T.rule,
        flexShrink: 0,
        marginTop: 2,
      }}
    >
      {active ? "\u2713" : "\u2717"}
    </span>
  );
}

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <PageContainer className="max-w-2xl">
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Logo />
        <h1
          style={{
            marginTop: 24,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            fontSize: 32,
            fontStyle: "italic",
            color: T.ink,
          }}
        >
          Upgrade to{" "}
          <span style={{ fontFamily: "'Homemade Apple', cursive", color: T.sageD, fontSize: 28 }}>
            Pro
          </span>
        </h1>
        <p
          style={{
            marginTop: 8,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 17,
            fontStyle: "italic",
            color: T.inkSoft,
            lineHeight: 1.6,
          }}
        >
          Never miss another credit card credit. Ever.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {/* Free plan card */}
        <div
          style={{
            position: "relative",
            border: `1px solid ${T.rule}`,
            background: T.card,
            padding: 32,
          }}
        >
          {/* inner frame */}
          <div
            style={{
              position: "absolute",
              inset: 6,
              border: `1px solid ${T.rule}`,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                fontSize: 20,
                color: T.ink,
              }}
            >
              Free
            </h3>
            <p
              style={{
                marginTop: 4,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                fontSize: 32,
                color: T.ink,
              }}
            >
              $0
              <span
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 16,
                  fontWeight: 400,
                  color: T.inkSoft,
                }}
              >
                /year
              </span>
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "24px 0 0",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {[
                { text: <><strong>1 card</strong> tracked</>, active: true },
                { text: <>Quarterly, semi-annual &amp; annual reminders</>, active: true },
                { text: <>30-day + 7-day email alerts</>, active: true },
                { text: <>Monthly credit reminders</>, active: false },
                { text: <>Unlimited cards</>, active: false },
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 15,
                    color: item.active ? T.inkSoft : T.rule,
                    lineHeight: 1.4,
                  }}
                >
                  <CheckIcon active={item.active} />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 24 }}>
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <Button variant="secondary" className="w-full">
                  Current plan
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Pro plan card */}
        <div
          style={{
            position: "relative",
            border: `1.5px solid ${T.sageD}`,
            background: T.card,
            padding: 32,
          }}
        >
          {/* inner frame */}
          <div
            style={{
              position: "absolute",
              inset: 6,
              border: `1px solid ${T.sage}`,
              pointerEvents: "none",
            }}
          />

          {/* badge */}
          <div
            style={{
              position: "absolute",
              top: -12,
              left: 20,
              fontFamily: "'Caveat', cursive",
              fontSize: 15,
              background: T.sageD,
              color: T.card,
              padding: "3px 14px",
              borderRadius: 0,
            }}
          >
            Recommended
          </div>

          <div style={{ position: "relative" }}>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                fontSize: 20,
                color: T.ink,
              }}
            >
              Pro
            </h3>
            <p
              style={{
                marginTop: 4,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                fontSize: 32,
                color: T.ink,
              }}
            >
              $10
              <span
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 16,
                  fontWeight: 400,
                  color: T.inkSoft,
                }}
              >
                /year
              </span>
            </p>
            <p
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 15,
                color: T.inkSoft,
              }}
            >
              Less than $1/month
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "24px 0 0",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {[
                <><strong>Unlimited cards</strong> tracked</>,
                <>All reminder frequencies</>,
                <><strong>Monthly credits</strong> (DoorDash, Uber, Lyft, etc.)</>,
                <>30-day + 7-day email alerts</>,
                <>Cancel anytime</>,
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 15,
                    color: T.inkSoft,
                    lineHeight: 1.4,
                  }}
                >
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 24 }}>
              <Button onClick={handleUpgrade} disabled={loading} className="w-full">
                {loading ? "Redirecting..." : "Upgrade for $10/year"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <p
        style={{
          marginTop: 24,
          textAlign: "center",
          fontFamily: "'Caveat', cursive",
          fontSize: 15,
          color: T.inkSoft,
        }}
      >
        One credit card credit pays for 10+ years of Pro. Cancel anytime.
      </p>
    </PageContainer>
  );
}
