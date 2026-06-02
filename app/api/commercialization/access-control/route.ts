import { NextResponse } from "next/server";
import { buildProductionAccessControlFoundation } from "@/lib/commercialization/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H10 Access Control API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildProductionAccessControlFoundation({ deploymentId: "access-control-api" });
  return NextResponse.json(foundation);
}
