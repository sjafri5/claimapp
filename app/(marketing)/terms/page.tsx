import type { Metadata } from "next";
import { Logo } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — claim.app",
  description: "Terms of service for using the claim.app email reminder service.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/">
        <Logo />
      </Link>

      <h1 className="mt-8 text-3xl font-bold text-gray-900">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: May 2026</p>

      <div className="mt-8 space-y-6 text-gray-600">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Service</h2>
          <p>
            claim.app is an email reminder service that notifies you about
            upcoming credit card benefit deadlines. We do not guarantee the
            accuracy of benefit details, amounts, or deadlines. Always verify
            with your card issuer.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            No financial advice
          </h2>
          <p>
            claim.app is not a financial advisor. Our reminders are
            informational only. We are not affiliated with Chase, United, or any
            card issuer. Benefit details may change without notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Email consent
          </h2>
          <p>
            By signing up, you consent to receive recurring email reminders at
            the email address you provide. Email frequency varies based on your
            credits. You can opt out at any time by clicking unsubscribe in any
            email or from your dashboard.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Limitation of liability
          </h2>
          <p>
            claim.app is provided &quot;as is&quot; without warranties. We are
            not liable for missed reminders, incorrect credit information, or
            any financial losses resulting from use of this service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Account termination
          </h2>
          <p>
            You can terminate your account at any time by clicking unsubscribe
            in any email or from your dashboard. We reserve the right to
            terminate accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
          <p>
            Questions? Contact us at{" "}
            <a
              href="mailto:hi@claim.app"
              className="text-green-600 underline"
            >
              hi@claim.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
