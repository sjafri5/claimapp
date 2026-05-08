import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/send";
import { welcomeSubject, welcomeBody } from "@/lib/email/templates";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, html } = welcomeBody();
  await sendEmail(user.email, welcomeSubject(), text, html);

  return NextResponse.json({ success: true });
}
