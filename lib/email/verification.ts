import crypto from "crypto";
import { sendEmail } from "./send";
import { db } from "@/lib/db";
import { verificationCodes } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { verificationEmailText, verificationEmailHtml } from "./templates";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function sendVerificationCode(email: string): Promise<void> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  // Delete old codes for this email, then insert new one
  await db
    .delete(verificationCodes)
    .where(eq(verificationCodes.email, email));

  await db.insert(verificationCodes).values({
    email,
    code,
    expiresAt,
  });

  await sendEmail(
    email,
    "Your claim.app verification code",
    verificationEmailText(code),
    verificationEmailHtml(code)
  );
}

export async function checkVerificationCode(
  email: string,
  code: string
): Promise<boolean> {
  const [stored] = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.code, code),
        gt(verificationCodes.expiresAt, new Date())
      )
    );

  if (!stored) return false;

  // Delete used code
  await db
    .delete(verificationCodes)
    .where(eq(verificationCodes.id, stored.id));

  return true;
}
