import { NextResponse } from "next/server";
import { buildRetentionMetrics } from "@/lib/growth/v63-retention-light.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const metrics = buildRetentionMetrics();
  return NextResponse.json({ ok: true, ...metrics });
}
