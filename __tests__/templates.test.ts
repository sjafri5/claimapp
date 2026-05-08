import { describe, it, expect } from "vitest";
import {
  welcomeSubject,
  welcomeBody,
  monthBeforeSubject,
  monthBeforeBody,
  weekBeforeSubject,
  weekBeforeBody,
  formatDeadline,
  verificationEmailText,
  verificationEmailHtml,
} from "@/lib/email/templates";

describe("Email templates", () => {
  it("welcome email has subject and body", () => {
    const subject = welcomeSubject();
    expect(subject).toContain("claim.app");

    const { text, html } = welcomeBody();
    expect(text).toContain("dollar");
    expect(html).toContain("claim.app");
    expect(html).toContain("dashboard");
  });

  it("verification email contains code", () => {
    const text = verificationEmailText("123456");
    expect(text).toContain("123456");

    const html = verificationEmailHtml("123456");
    expect(html).toContain("123456");
    expect(html).toContain("10 minutes");
  });

  it("month-before email includes required fields", () => {
    const subject = monthBeforeSubject("StubHub credit", 150);
    expect(subject).toContain("$150");
    expect(subject).toContain("StubHub credit");
    expect(subject).toContain("30");

    const { text, html } = monthBeforeBody(
      "StubHub credit",
      "Chase Sapphire Reserve",
      "Jun 30, 2026",
      150
    );
    expect(text).toContain("StubHub credit");
    expect(text).toContain("Chase Sapphire Reserve");
    expect(text).toContain("$150");
    expect(html).toContain("$150");
    expect(html).toContain("dashboard");
  });

  it("week-before email includes required fields", () => {
    const subject = weekBeforeSubject("StubHub credit", 150);
    expect(subject).toContain("$150");
    expect(subject).toContain("StubHub credit");

    const { text, html } = weekBeforeBody(
      "StubHub credit",
      "Chase Sapphire Reserve",
      "Jun 30, 2026",
      150
    );
    expect(text).toContain("StubHub credit");
    expect(text).toContain("$150");
    expect(html).toContain("dashboard");
  });

  it("formatDeadline formats correctly", () => {
    const date = new Date(2026, 5, 30);
    const formatted = formatDeadline(date);
    expect(formatted).toContain("Jun");
    expect(formatted).toContain("30");
    expect(formatted).toContain("2026");
  });
});
