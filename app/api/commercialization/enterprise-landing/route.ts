import { NextResponse } from "next/server";
import { buildEnterpriseLandingFoundation } from "@/lib/commercialization/landing/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H17 Enterprise Landing API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const foundation = buildEnterpriseLandingFoundation({ deploymentId: "enterprise-landing-api" });
  return NextResponse.json(foundation);
}
