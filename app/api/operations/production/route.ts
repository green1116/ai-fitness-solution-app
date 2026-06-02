import { NextResponse } from "next/server";
import { buildV4ProductionOperationsFoundation } from "@/lib/operations/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V4-A1 Production Operations API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildV4ProductionOperationsFoundation({
    deploymentId: "production-operations-api",
  });
  return NextResponse.json(foundation);
}
