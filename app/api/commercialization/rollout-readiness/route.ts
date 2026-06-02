import { NextResponse } from "next/server";
import { buildEnterpriseRolloutFoundation } from "@/lib/commercialization/deployment-readiness/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H18 Rollout Readiness API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildEnterpriseRolloutFoundation({ deploymentId: "rollout-readiness-api" });
  return NextResponse.json(foundation);
}
