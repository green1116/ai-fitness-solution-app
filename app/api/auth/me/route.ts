// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth-server";

export async function GET() {
  const email = await getSessionEmail();
  return NextResponse.json({ ok: true, email });
}
