import { NextRequest, NextResponse } from "next/server";
import { runReminderEngine } from "@/lib/reminders/engine";

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel Cron sends this as Authorization header)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runReminderEngine();

    console.log(
      `Reminder engine completed: ${result.sent} sent, ${result.skipped} skipped, ${result.errors.length} errors`
    );

    if (result.errors.length > 0) {
      console.error("Reminder errors:", result.errors);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Cron send-reminders failed:", err);
    return NextResponse.json(
      { error: "Reminder engine failed" },
      { status: 500 }
    );
  }
}
