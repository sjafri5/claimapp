import { Resend } from "resend";

let client: Resend | null = null;

function getClient() {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY!);
  }
  return client;
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<{ messageId: string } | null> {
  const isDryRun = process.env.DRY_RUN === "true";

  if (isDryRun) {
    console.log(`[DRY_RUN] Email to ${to}: ${subject}\n${text}`);
    return { messageId: `dry_run_${Date.now()}` };
  }

  const resend = getClient();
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "claim.app <hi@claim.app>",
    to,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return { messageId: data?.id ?? "" };
}
