import { NextResponse } from "next/server";
import { buildEnterpriseLifecycleFoundation } from "@/lib/commercialization/lifecycle/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H24 Enterprise Lifecycle API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildEnterpriseLifecycleFoundation({ deploymentId: "lifecycle-api" });
  return NextResponse.json(foundation);
}
