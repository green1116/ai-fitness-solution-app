import { NextResponse } from "next/server";
import { buildProductionGovernanceFoundation } from "@/lib/commercialization/governance/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H12 Governance API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildProductionGovernanceFoundation({ deploymentId: "governance-api" });
  return NextResponse.json(foundation);
}
