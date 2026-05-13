"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, PageContainer, Logo, Card } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send code");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("signup_email", email.trim().toLowerCase());
      router.push("/verify");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Logo />
        <h1
          style={{
            marginTop: 24,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            fontSize: 28,
            fontStyle: "italic",
            color: "#3a342b",
          }}
        >
          Get started
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
          Enter your email to receive reminders about your credit card credits.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            error={error}
          />

          <div style={{ marginTop: 20 }}>
            <Button
              type="submit"
              disabled={loading || !email.includes("@")}
              className="w-full"
            >
              {loading ? "Sending code..." : "Send verification code"}
            </Button>
          </div>
        </form>

        <p
          style={{
            marginTop: 20,
            fontFamily: "'Caveat', cursive",
            fontSize: 14,
            color: "#6b5f4d",
          }}
        >
          By signing up I agree to receive email reminders from claim.app.{" "}
          <a href="/privacy" style={{ textDecoration: "underline", color: "#6b5f4d" }}>
            Privacy Policy
          </a>{" "}
          &amp;{" "}
          <a href="/terms" style={{ textDecoration: "underline", color: "#6b5f4d" }}>
            Terms
          </a>
          .
        </p>
      </Card>
    </PageContainer>
  );
}
