import { NextResponse } from "next/server";
import { buildV4OperationalIntelligenceRuntime } from "@/lib/operations/intelligence/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V4-A2 Operational Intelligence API — readonly GET surface.
 */
export async function GET() {
  const foundation = buildV4OperationalIntelligenceRuntime({
    deploymentId: "operational-intelligence-api",
  });
  return NextResponse.json(foundation);
}
