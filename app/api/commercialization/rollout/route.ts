import { NextResponse } from "next/server";
import { buildProductionRolloutFoundation } from "@/lib/commercialization/rollout/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H19 Production Rollout API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildProductionRolloutFoundation({ deploymentId: "rollout-api" });
  return NextResponse.json(foundation);
}
