import { NextResponse } from "next/server";
import { buildEnterpriseLaunchClosureFoundation } from "@/lib/commercialization/launch-closure/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H21 Launch Closure API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildEnterpriseLaunchClosureFoundation({ deploymentId: "launch-closure-api" });
  return NextResponse.json(foundation);
}
