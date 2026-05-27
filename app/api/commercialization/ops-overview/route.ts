import { NextResponse } from "next/server";
import { buildEnterpriseOpsOverview } from "@/lib/commercialization/portal/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H13 Enterprise Ops Overview API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const overview = buildEnterpriseOpsOverview({ deploymentId: "ops-overview-api" });
  return NextResponse.json(overview);
}
