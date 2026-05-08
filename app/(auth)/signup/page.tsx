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
      <div className="mb-8 text-center">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Get started</h1>
        <p className="mt-2 text-gray-600">
          Enter your email to receive reminders about your credit card credits.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            error={error}
          />

          <Button
            type="submit"
            disabled={loading || !email.includes("@")}
            className="w-full"
          >
            {loading ? "Sending code..." : "Send verification code"}
          </Button>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          By signing up I agree to receive email reminders from claim.app.{" "}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>{" "}
          &amp;{" "}
          <a href="/terms" className="underline">
            Terms
          </a>
          .
        </p>
      </Card>
    </PageContainer>
  );
}
