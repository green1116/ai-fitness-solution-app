import { NextResponse } from "next/server";
import { buildProductionCommandCenterFoundation } from "@/lib/commercialization/command-center/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H15 Command Center API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildProductionCommandCenterFoundation({ deploymentId: "command-center-api" });
  return NextResponse.json(foundation);
}
