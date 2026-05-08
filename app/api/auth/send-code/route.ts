import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendVerificationCode } from "@/lib/email/verification";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    await sendVerificationCode(email);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    console.error("send-code error:", message, stack);
    return NextResponse.json(
      { error: message, detail: stack?.split("\n").slice(0, 3).join(" | ") },
      { status: 500 }
    );
  }
}
