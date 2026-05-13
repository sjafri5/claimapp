import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = user.email === process.env.ADMIN_EMAIL;
  return NextResponse.json({
    id: user.id,
    email: user.email,
    plan: user.plan,
    isAdmin,
  });
}
