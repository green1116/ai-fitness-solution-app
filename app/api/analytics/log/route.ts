import { NextResponse } from "next/server";
import { appendAnalyticsEvent } from "@/lib/analytics/inMemoryEvents";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  appendAnalyticsEvent(body);
  return NextResponse.json({ ok: true });
}
