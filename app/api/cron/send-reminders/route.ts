import { NextRequest, NextResponse } from "next/server";
import { runReminderEngine } from "@/lib/reminders/engine";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel Cron sends this as Authorization header)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runReminderEngine();

    logger.info("Reminder engine completed", {
      sent: result.sent,
      skipped: result.skipped,
      errorCount: result.errors.length,
    });

    if (result.errors.length > 0) {
      logger.error("Reminder errors", result.errors);
    }

    return NextResponse.json(result);
  } catch (err) {
    logger.error("Cron send-reminders failed", err);
    return NextResponse.json(
      { error: "Reminder engine failed" },
      { status: 500 }
    );
  }
}
