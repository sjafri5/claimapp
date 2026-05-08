"use client";

import { useState } from "react";
import { Button, PageContainer, Logo, Card } from "@/components/ui";
import Link from "next/link";

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
      <div className="mb-8 text-center">
        <Logo />
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Upgrade to Pro
        </h1>
        <p className="mt-2 text-gray-600">
          Never miss another credit card credit. Ever.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Free */}
        <Card className="relative">
          <h3 className="text-lg font-semibold text-gray-900">Free</h3>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            $0<span className="text-base font-normal text-gray-500">/year</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span><strong>1 card</strong> tracked</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span>Quarterly, semi-annual &amp; annual reminders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span>30-day + 7-day email alerts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-gray-300">&#10007;</span>
              <span className="text-gray-400">Monthly credit reminders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-gray-300">&#10007;</span>
              <span className="text-gray-400">Unlimited cards</span>
            </li>
          </ul>
          <div className="mt-6">
            <Link href="/dashboard">
              <Button variant="secondary" className="w-full">
                Current plan
              </Button>
            </Link>
          </div>
        </Card>

        {/* Pro */}
        <Card className="relative border-green-300 ring-2 ring-green-100">
          <div className="absolute -top-3 left-4 rounded-full bg-green-600 px-3 py-0.5 text-xs font-semibold text-white">
            Recommended
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            $10
            <span className="text-base font-normal text-gray-500">/year</span>
          </p>
          <p className="text-sm text-gray-500">Less than $1/month</p>
          <ul className="mt-6 space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span>
                <strong>Unlimited cards</strong> tracked
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span>All reminder frequencies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span>
                <strong>Monthly credits</strong> (DoorDash, Uber, Lyft, etc.)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span>30-day + 7-day email alerts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span>Cancel anytime</span>
            </li>
          </ul>
          <div className="mt-6">
            <Button onClick={handleUpgrade} disabled={loading} className="w-full">
              {loading ? "Redirecting..." : "Upgrade for $10/year"}
            </Button>
          </div>
        </Card>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        One credit card credit pays for 10+ years of Pro. Cancel anytime.
      </p>
    </PageContainer>
  );
}
