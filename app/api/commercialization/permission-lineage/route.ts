import { NextResponse } from "next/server";
import { buildPermissionLineage } from "@/lib/commercialization/governance/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H12 Permission Lineage API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const lineage = buildPermissionLineage({ deploymentId: "permission-lineage-api" });
  return NextResponse.json(lineage);
}
