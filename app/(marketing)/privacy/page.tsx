import { Logo } from "@/components/ui";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/">
        <Logo />
      </Link>

      <h1 className="mt-8 text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: May 2026</p>

      <div className="mt-8 space-y-6 text-gray-600">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Information we collect
          </h2>
          <p>
            We collect your email address, timezone, and card selections to
            deliver email reminders about your credit card benefit deadlines. We
            do not collect your card numbers, financial data, or login
            credentials for any financial institution.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            How we use your information
          </h2>
          <p>
            Your email address is used solely to send you reminders about
            upcoming credit card benefit deadlines. Your timezone ensures
            messages arrive at appropriate hours. Your card selections determine
            which credits to track.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Email communications
          </h2>
          <p>
            By providing your email and completing verification, you consent to
            receive recurring email reminders from claim.app. Email frequency
            varies based on your credits. You can unsubscribe at any time from
            your dashboard.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Data sharing
          </h2>
          <p>
            We use SMTP email services to deliver messages. Your email address
            is shared with our email provider solely for delivery purposes. We
            do not sell or share your personal information with any other third
            parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Data retention
          </h2>
          <p>
            We retain your data for as long as your account is active. If you
            unsubscribe or request deletion, we will remove your personal data
            within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
          <p>
            For privacy-related questions, contact us at{" "}
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
