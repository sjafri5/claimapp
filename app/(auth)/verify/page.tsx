"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, PageContainer, Logo, Card } from "@/components/ui";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("signup_email");
    if (!stored) {
      router.push("/signup");
      return;
    }
    setEmail(stored);
  }, [router]);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, timezone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      sessionStorage.removeItem("signup_email");
      router.push("/onboarding/cards");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-8 text-center">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Check your email
        </h1>
        <p className="mt-2 text-gray-600">
          We sent a 6-digit code to {email}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Verification code"
            type="text"
            value={code}
            onChange={(val) => setCode(val.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            error={error}
          />

          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
}
