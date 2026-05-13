import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — claim.app",
  description:
    "Create your free account to get email reminders about your premium credit card benefits before they expire.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
