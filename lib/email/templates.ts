const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://claim.app";

// ── Color palette (resolved hex, no CSS vars) ──────────────────────────
const C = {
  paper: "#efe7d4",
  card: "#fffbf0",
  ink: "#3a342b",
  inkSoft: "#6b5f4d",
  sage: "#6f8a5e",
  rose: "#c98a8a",
  ochre: "#d4a83c",
  rule: "#b8a784",
} as const;

// ── Google Fonts link (Apple Mail renders, Gmail falls back to Georgia) ─
const FONT_LINK = `<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Homemade+Apple&display=swap" rel="stylesheet">`;

// ── Font stacks ────────────────────────────────────────────────────────
const F = {
  body: `'Cormorant Garamond', Georgia, 'Times New Roman', serif`,
  accent: `'Homemade Apple', cursive`,
  label: `'Caveat', cursive`,
} as const;

// ── Shared helpers ─────────────────────────────────────────────────────

function logoHtml(): string {
  return `<tr><td align="center" style="padding-bottom:16px;">
    <span style="font-family:${F.accent};font-size:23px;color:${C.ink};letter-spacing:0.5px;">claim<span style="color:${C.sage};">.</span>app</span>
  </td></tr>`;
}

function hairlineRule(): string {
  return `<tr><td align="center" style="padding-bottom:24px;">
    <table width="60" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="border-top:1px solid ${C.rule};font-size:0;line-height:0;">&nbsp;</td>
    </tr></table>
  </td></tr>`;
}

function textDivider(): string {
  return `<tr><td align="center" style="padding:20px 0;font-size:14px;color:${C.rule};letter-spacing:6px;">&#8226; &#8212; &#8226;</td></tr>`;
}

function footerHtml(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">
    <tr><td align="center" style="padding:24px 0 40px;font-family:${F.label};font-size:18px;color:${C.inkSoft};">
      claim<span style="color:${C.sage};">.</span>app &nbsp;&middot;&nbsp;
      <a href="${APP_URL}/dashboard" style="color:${C.inkSoft};text-decoration:underline;">your dashboard</a> &nbsp;&middot;&nbsp;
      <a href="${APP_URL}/dashboard/settings" style="color:${C.inkSoft};text-decoration:underline;">unsubscribe</a>
    </td></tr>
  </table>`;
}

function signOff(): string {
  return `<tr><td style="padding-top:28px;font-family:${F.accent};font-size:18px;color:${C.ink};">
    &mdash; claim.app
  </td></tr>`;
}

/** Wrap body rows inside the shared card + paper shell */
function shell(bodyRows: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${FONT_LINK}
</head>
<body style="margin:0;padding:0;background-color:${C.paper};-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.paper};">
    <tr><td align="center" style="padding:40px 16px;">

      <!--[if mso]><table width="600" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
      <table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${C.card};border:1px solid ${C.rule};border-collapse:collapse;">
        <tr><td>
          <!-- Inner border (inset frame) -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:4px solid ${C.card};">
            <tr><td>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${C.rule};">
                <tr><td style="padding:48px 56px 40px;font-family:${F.body};font-size:17px;line-height:1.65;color:${C.ink};">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${logoHtml()}
                    ${hairlineRule()}
                    ${bodyRows}
                  </table>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->

      ${footerHtml()}

    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(
  label: string,
  href: string,
  bgColor: string = C.ink,
  textColor: string = C.card
): string {
  return `<tr><td align="center" style="padding:28px 0 8px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td style="border:1px solid ${C.rule};padding:3px;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background-color:${bgColor};padding:14px 36px;">
            <a href="${href}" style="font-family:${F.body};font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${textColor};text-decoration:none;">${label}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  1. VERIFICATION EMAIL (code)
// ═══════════════════════════════════════════════════════════════════════

export function verificationEmailHtml(code: string): string {
  const body = `
    <tr><td align="center" style="font-family:${F.label};font-size:17px;color:${C.sage};letter-spacing:1px;padding-bottom:6px;">welcome aboard</td></tr>
    <tr><td style="font-family:${F.body};font-size:26px;font-weight:600;line-height:1.35;color:${C.ink};padding-bottom:16px;">
      Hello there. Let&rsquo;s not lose another <span style="font-family:${F.accent};color:${C.sage};">dollar</span>.
    </td></tr>
    <tr><td style="padding-bottom:28px;font-family:${F.body};font-size:17px;color:${C.inkSoft};line-height:1.65;">
      Your verification code is below.
    </td></tr>
    <tr><td align="center" style="padding:16px 0 8px;">
      <span style="font-family:${F.accent};font-size:32px;color:${C.sage};letter-spacing:6px;">${code}</span>
    </td></tr>
    <tr><td align="center" style="font-family:${F.label};font-size:16px;color:${C.inkSoft};padding-bottom:12px;">
      this code expires in 10 minutes
    </td></tr>
    ${textDivider()}
    ${signOff()}
  `;
  return shell(body);
}

export function verificationEmailText(code: string): string {
  return [
    "Welcome aboard!",
    "",
    "Hello there. Let's not lose another dollar.",
    "",
    `Your verification code is: ${code}`,
    "",
    "This code expires in 10 minutes.",
    "",
    "-- claim.app",
  ].join("\n");
}

// ═══════════════════════════════════════════════════════════════════════
//  2. WELCOME (post-verification)
// ═══════════════════════════════════════════════════════════════════════

export function welcomeSubject(): string {
  return "Welcome to claim.app — let's not lose another dollar";
}

export function welcomeBody(): { text: string; html: string } {
  const body = `
    <tr><td align="center" style="font-family:${F.label};font-size:17px;color:${C.sage};letter-spacing:1px;padding-bottom:6px;">welcome aboard</td></tr>
    <tr><td style="font-family:${F.body};font-size:26px;font-weight:600;line-height:1.35;color:${C.ink};padding-bottom:16px;">
      Hello there. Let&rsquo;s not lose another <span style="font-family:${F.accent};color:${C.sage};">dollar</span>.
    </td></tr>
    <tr><td style="padding-bottom:20px;font-family:${F.body};font-size:17px;color:${C.inkSoft};line-height:1.65;">
      Tap the button below to visit your dashboard and we&rsquo;ll get you set up.
    </td></tr>
    ${ctaButton("view my dashboard", `${APP_URL}/dashboard`)}
    ${textDivider()}
    <tr><td style="font-family:${F.body};font-size:16px;color:${C.inkSoft};line-height:1.65;padding-bottom:8px;">
      We&rsquo;ll send you a reminder <strong>twice per credit per year</strong> &mdash; once 30&nbsp;days before expiry and once 7&nbsp;days before. That&rsquo;s it. No spam.
    </td></tr>
    ${signOff()}
    <tr><td style="font-family:${F.label};font-size:16px;color:${C.inkSoft};padding-top:16px;">
      p.s. if you ever want to stop hearing from us, there&rsquo;s an unsubscribe link in the footer.
    </td></tr>
  `;

  const text = [
    "Welcome aboard!",
    "",
    "Hello there. Let's not lose another dollar.",
    "",
    "Tap the link below to visit your dashboard and we'll get you set up.",
    `${APP_URL}/dashboard`,
    "",
    "We'll send you a reminder twice per credit per year — once 30 days before expiry and once 7 days before. That's it. No spam.",
    "",
    "-- claim.app",
    "",
    "p.s. if you ever want to stop hearing from us, there's an unsubscribe link in the footer.",
  ].join("\n");

  return { text, html: shell(body) };
}

// ═══════════════════════════════════════════════════════════════════════
//  3. MONTH-BEFORE REMINDER (30 days)
// ═══════════════════════════════════════════════════════════════════════

export function monthBeforeSubject(creditName: string, amountDollars: number): string {
  return `$${amountDollars} ${creditName} — 30 days left`;
}

export function monthBeforeBody(
  creditName: string,
  cardName: string,
  deadline: string,
  amountDollars: number
): { text: string; html: string } {
  const daysLeft = 30;

  const creditBox = `
    <tr><td style="padding:24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid ${C.sage};background-color:${C.card};">
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.sage};margin:3px;">
            <tr><td style="padding:24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="font-family:${F.label};font-size:17px;color:${C.sage};padding-bottom:4px;">on your ${cardName}</td></tr>
                <tr><td style="font-family:${F.body};font-size:30px;font-weight:700;color:${C.ink};padding-bottom:16px;">$${amountDollars} ${creditName}</td></tr>
                <tr><td>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-family:${F.label};font-size:15px;color:${C.inkSoft};padding-bottom:6px;" width="40%">amount remaining</td>
                      <td style="font-family:${F.accent};font-size:30px;color:${C.sage};text-align:right;" width="60%">$${amountDollars}</td>
                    </tr>
                    <tr><td colspan="2" style="border-top:1px solid ${C.rule};font-size:0;line-height:0;padding:6px 0;">&nbsp;</td></tr>
                    <tr>
                      <td style="font-family:${F.label};font-size:15px;color:${C.inkSoft};padding-bottom:6px;">expires</td>
                      <td style="font-family:${F.label};font-size:24px;color:${C.ochre};text-align:right;">${deadline}</td>
                    </tr>
                    <tr><td colspan="2" style="border-top:1px solid ${C.rule};font-size:0;line-height:0;padding:6px 0;">&nbsp;</td></tr>
                    <tr>
                      <td style="font-family:${F.label};font-size:15px;color:${C.inkSoft};">days left</td>
                      <td style="font-family:${F.label};font-size:24px;color:${C.inkSoft};text-align:right;">${daysLeft}</td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>`;

  const body = `
    <tr><td align="center" style="font-family:${F.label};font-size:17px;color:${C.sage};letter-spacing:1px;padding-bottom:6px;">a gentle reminder &middot; 30 days out</td></tr>
    <tr><td style="font-family:${F.body};font-size:26px;font-weight:600;font-style:italic;line-height:1.35;color:${C.ink};padding-bottom:16px;">
      Your ${creditName} credit hasn&rsquo;t been used.
    </td></tr>
    <tr><td style="padding-bottom:8px;font-family:${F.body};font-size:17px;color:${C.inkSoft};line-height:1.65;">
      There&rsquo;s still plenty of time. Just wanted to put it on your radar.
    </td></tr>
    ${creditBox}
    ${ctaButton("view dashboard", `${APP_URL}/dashboard`)}
    <tr><td align="center" style="padding:12px 0 4px;">
      <a href="${APP_URL}/dashboard" style="font-family:${F.label};font-size:16px;color:${C.inkSoft};text-decoration:underline;">already used it? mark it complete</a>
    </td></tr>
    ${textDivider()}
    ${signOff()}
    <tr><td style="font-family:${F.label};font-size:16px;color:${C.inkSoft};padding-top:16px;">
      p.s. we&rsquo;ll send one more reminder seven days before expiry.
    </td></tr>
  `;

  const text = [
    `A gentle reminder — 30 days out`,
    "",
    `Your ${creditName} credit hasn't been used.`,
    "",
    `There's still plenty of time. Just wanted to put it on your radar.`,
    "",
    `On your ${cardName}:`,
    `  $${amountDollars} ${creditName}`,
    `  Amount remaining: $${amountDollars}`,
    `  Expires: ${deadline}`,
    `  Days left: ${daysLeft}`,
    "",
    `View dashboard: ${APP_URL}/dashboard`,
    `Already used it? Mark it complete on your dashboard.`,
    "",
    "-- claim.app",
    "",
    "p.s. we'll send one more reminder seven days before expiry.",
  ].join("\n");

  return { text, html: shell(body) };
}

// ═══════════════════════════════════════════════════════════════════════
//  4. WEEK-BEFORE REMINDER (7 days) — URGENT
// ═══════════════════════════════════════════════════════════════════════

export function weekBeforeSubject(creditName: string, amountDollars: number): string {
  return `[final notice · 7d] $${amountDollars} ${creditName}`;
}

export function weekBeforeBody(
  creditName: string,
  cardName: string,
  deadline: string,
  amountDollars: number
): { text: string; html: string } {
  const daysLeft = 7;

  const creditBox = `
    <tr><td style="padding:24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid ${C.rose};background-color:${C.card};">
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.rose};margin:3px;">
            <tr><td style="padding:24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="font-family:${F.label};font-size:17px;color:${C.rose};padding-bottom:4px;">on your ${cardName}</td></tr>
                <tr><td style="font-family:${F.body};font-size:30px;font-weight:700;color:${C.ink};padding-bottom:16px;">$${amountDollars} ${creditName}</td></tr>
                <tr><td>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-family:${F.label};font-size:15px;color:${C.inkSoft};padding-bottom:6px;" width="40%">amount remaining</td>
                      <td style="font-family:${F.accent};font-size:30px;color:${C.rose};text-align:right;" width="60%">$${amountDollars}</td>
                    </tr>
                    <tr><td colspan="2" style="border-top:1px solid ${C.rule};font-size:0;line-height:0;padding:6px 0;">&nbsp;</td></tr>
                    <tr>
                      <td style="font-family:${F.label};font-size:15px;color:${C.inkSoft};padding-bottom:6px;">expires</td>
                      <td style="font-family:${F.label};font-size:24px;color:${C.rose};font-weight:700;text-align:right;">${deadline}</td>
                    </tr>
                    <tr><td colspan="2" style="border-top:1px solid ${C.rule};font-size:0;line-height:0;padding:6px 0;">&nbsp;</td></tr>
                    <tr>
                      <td style="font-family:${F.label};font-size:15px;color:${C.inkSoft};">days left</td>
                      <td style="font-family:${F.label};font-size:24px;color:${C.rose};font-weight:700;text-align:right;">${daysLeft}</td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>`;

  const body = `
    <tr><td align="center" style="font-family:${F.label};font-size:17px;color:${C.rose};letter-spacing:1px;padding-bottom:6px;">last call &middot; 7 days remaining</td></tr>
    <tr><td style="font-family:${F.body};font-size:26px;font-weight:600;font-style:italic;line-height:1.35;color:${C.ink};padding-bottom:16px;">
      Your ${creditName} credit <span style="color:${C.rose};">expires</span> next week.
    </td></tr>
    <tr><td style="padding-bottom:8px;font-family:${F.body};font-size:17px;color:${C.inkSoft};line-height:1.65;">
      If you&rsquo;d like to use it, this is the last polite poke from us.
    </td></tr>
    ${creditBox}
    <tr><td style="padding-bottom:8px;font-family:${F.body};font-size:17px;color:${C.inkSoft};line-height:1.65;">
      After ${deadline} it&rsquo;s gone &mdash; no rollover.
    </td></tr>
    ${ctaButton("view dashboard", `${APP_URL}/dashboard`, C.ink, C.card)}
    <tr><td align="center" style="padding:12px 0 4px;">
      <a href="${APP_URL}/dashboard" style="font-family:${F.label};font-size:16px;color:${C.inkSoft};text-decoration:underline;">already used it? mark it complete</a>
    </td></tr>
    ${textDivider()}
    ${signOff()}
  `;

  const text = [
    `[final notice · 7d]`,
    "",
    `Last call — 7 days remaining`,
    "",
    `Your ${creditName} credit expires next week.`,
    "",
    `If you'd like to use it, this is the last polite poke from us.`,
    "",
    `On your ${cardName}:`,
    `  $${amountDollars} ${creditName}`,
    `  Amount remaining: $${amountDollars}`,
    `  Expires: ${deadline}`,
    `  Days left: ${daysLeft}`,
    "",
    `After ${deadline} it's gone — no rollover.`,
    "",
    `View dashboard: ${APP_URL}/dashboard`,
    `Already used it? Mark it complete on your dashboard.`,
    "",
    "-- claim.app",
  ].join("\n");

  return { text, html: shell(body) };
}

// ═══════════════════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════════════════

export function formatDeadline(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
