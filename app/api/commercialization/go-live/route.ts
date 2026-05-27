import { NextResponse } from "next/server";
import { buildProductionGoLiveFoundation } from "@/lib/commercialization/go-live/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H20 Production Go-Live API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildProductionGoLiveFoundation({ deploymentId: "go-live-api" });
  return NextResponse.json(foundation);
}
