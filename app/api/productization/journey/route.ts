import { NextResponse } from "next/server";
import { buildCustomerJourneyResponse } from "@/lib/productization/journey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V8.2 Customer Journey API — readonly GET surface.
 * Returns journey, stages, metrics, and analytics.
 */
export async function GET() {
  const response = buildCustomerJourneyResponse({ deploymentId: "customer-journey-api" });
  return NextResponse.json({
    journey: response.journey,
    stages: response.stages,
    metrics: response.metrics,
    analytics: response.analytics,
  });
}
