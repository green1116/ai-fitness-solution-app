import { NextResponse } from "next/server";
import { buildUnifiedDashboardOverview } from "@/lib/commercialization/dashboard-integration/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H14 Unified Dashboard Overview API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const overview = buildUnifiedDashboardOverview({ deploymentId: "dashboard-overview-api" });
  return NextResponse.json(overview);
}
