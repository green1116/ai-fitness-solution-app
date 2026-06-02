import { NextResponse } from "next/server";
import { buildEnterpriseRetentionFoundation } from "@/lib/commercialization/retention/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H23 Archive Access API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildEnterpriseRetentionFoundation({ deploymentId: "archive-access-api" });
  return NextResponse.json(foundation);
}
