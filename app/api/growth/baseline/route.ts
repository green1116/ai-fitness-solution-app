import { NextResponse } from "next/server";
import { buildGrowthBaseline } from "@/lib/growth/v63-usage-baseline.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const baseline = buildGrowthBaseline();
  return NextResponse.json({ ok: true, baseline });
}
