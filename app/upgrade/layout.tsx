import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade to Pro — claim.app",
  description:
    "Unlock unlimited card tracking and monthly credit reminders with claim.app Pro.",
};

export default function UpgradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
