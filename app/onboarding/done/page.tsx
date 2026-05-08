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
      <div className="mb-8 text-center">
        <Logo />
        <div className="mt-6 text-5xl">&#10003;</div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          You&apos;re all set!
        </h1>
        <p className="mt-2 text-gray-600">
          You&apos;ll get your first email when your soonest credit hits 30 days
          before expiration. We sent you a welcome email.
        </p>
      </div>

      <Card>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>How it works:</strong>
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              You&apos;ll get an email <strong>30 days</strong> and{" "}
              <strong>7 days</strong> before each credit expires
            </li>
            <li>
              Click <strong>&quot;Mark as done&quot;</strong> on your dashboard
              when you&apos;ve used a credit to skip remaining reminders
            </li>
            <li>
              Unsubscribe anytime from your dashboard
            </li>
          </ul>
        </div>
      </Card>

      <Link href="/dashboard" className="mt-6 block">
        <Button className="w-full">View your dashboard</Button>
      </Link>
    </PageContainer>
  );
}
