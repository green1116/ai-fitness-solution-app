import { NextResponse } from "next/server";
import { buildEnterpriseArchivalFoundation } from "@/lib/commercialization/archival/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H22 Enterprise Archival API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildEnterpriseArchivalFoundation({ deploymentId: "archival-api" });
  return NextResponse.json(foundation);
}
