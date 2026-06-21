import { NextRequest, NextResponse } from "next/server";

import { buildGrowthDashboard } from "@/lib/growth/growth.service";

export async function GET() {
  const dashboard = buildGrowthDashboard();
  return NextResponse.json({ ok: true, ...dashboard });
}
