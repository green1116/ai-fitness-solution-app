import { NextResponse } from "next/server";
import { buildEnterprisePreservationClosureFoundation } from "@/lib/commercialization/preservation-closure/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H25 Preservation Closure API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildEnterprisePreservationClosureFoundation({
    deploymentId: "preservation-closure-api",
  });
  return NextResponse.json(foundation);
}
