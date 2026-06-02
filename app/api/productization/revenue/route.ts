import { NextResponse } from "next/server";
import { buildRevenueOperationsResponse } from "@/lib/productization/revenue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V8.7 Revenue Operations API — readonly GET surface.
 * Returns pipeline, metrics, forecast, report, and summary.
 */
export async function GET() {
  const response = buildRevenueOperationsResponse({ deploymentId: "revenue-operations-api" });
  return NextResponse.json({
    pipeline: response.pipeline,
    metrics: response.metrics,
    forecast: response.forecast,
    report: response.report,
    summary: response.summary,
  });
}
