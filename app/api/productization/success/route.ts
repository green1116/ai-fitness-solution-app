import { NextResponse } from "next/server";
import { buildCustomerSuccessResponse } from "@/lib/productization/success";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V8.6 Customer Success API — readonly GET surface.
 * Returns health, adoption, engagement, renewal, and summary.
 */
export async function GET() {
  const response = buildCustomerSuccessResponse({ deploymentId: "customer-success-api" });
  return NextResponse.json({
    health: response.health,
    adoption: response.adoption,
    engagement: response.engagement,
    renewal: response.renewal,
    summary: response.summary,
  });
}
