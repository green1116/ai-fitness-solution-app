import { NextResponse } from "next/server";
import { buildExpansionRenewalResponse } from "@/lib/productization/expansion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V8.9 Expansion & Renewal API — readonly GET surface.
 */
export async function GET() {
  const response = buildExpansionRenewalResponse({ deploymentId: "expansion-renewal-api" });
  return NextResponse.json({
    renewal: response.renewal,
    expansion: response.expansion,
    retention: response.retention,
    growth: response.growth,
    summary: response.summary,
  });
}
