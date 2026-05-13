"use client";

import { useEffect, useState } from "react";
import { Button, PageContainer, Logo, Card } from "@/components/ui";
import Link from "next/link";

export default function DonePage() {
  const [welcomed, setWelcomed] = useState(false);

  useEffect(() => {
    async function sendWelcome() {
      try {
        await fetch("/api/auth/welcome", { method: "POST" });
        setWelcomed(true);
      } catch {
        setWelcomed(true);
      }
    }
    sendWelcome();
  }, []);

  return (
    <PageContainer>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Logo />

        {/* Sage checkmark */}
        <div style={{ marginTop: 24 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ display: "inline-block" }}>
            <circle cx="32" cy="32" r="28" stroke="#9bb08a" strokeWidth="1.5" fill="none" />
            <polyline
              points="20,32 28,40 44,24"
              stroke="#6f8a5e"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          style={{
            marginTop: 16,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            fontSize: 28,
            fontStyle: "italic",
            color: "#3a342b",
          }}
        >
          You&apos;re all set!
        </h1>
        <p
          style={{
            marginTop: 8,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 16,
            fontStyle: "italic",
            color: "#6b5f4d",
            lineHeight: 1.6,
          }}
        >
          You&apos;ll get your first email when your soonest credit hits 30 days
          before expiration. We sent you a welcome email.
        </p>
      </div>

      <Card>
        <div>
          <p
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 20,
              color: "#6b5f4d",
              marginBottom: 12,
              fontWeight: 500,
            }}
          >
            How it works
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[
              <>You&apos;ll get an email <strong>30 days</strong> and <strong>7 days</strong> before each credit expires</>,
              <>Click <strong>&quot;Mark as done&quot;</strong> on your dashboard when you&apos;ve used a credit to skip remaining reminders</>,
              <>Unsubscribe anytime from your dashboard</>,
            ].map((item, i) => (
              <li
                key={i}
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 15,
                  color: "#6b5f4d",
                  lineHeight: 1.5,
                  paddingLeft: 18,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 7,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#9bb08a",
                    display: "inline-block",
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <Button className="w-full">View your dashboard</Button>
        </Link>
      </div>
    </PageContainer>
  );
}
