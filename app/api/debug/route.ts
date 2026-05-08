import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      "https://ehcmbcfcyfmodwziaeth.supabase.co",
      process.env.SUPABASE_SERVICE_KEY!
    );
    const { data, error } = await supabase.from("credits").select("id").limit(1);
    if (error) return NextResponse.json({ ok: false, error: error.message });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
