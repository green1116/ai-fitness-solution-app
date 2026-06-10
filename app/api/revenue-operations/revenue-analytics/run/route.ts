import { NextResponse } from "next/server";
import { runRevenueAnalyticsRuntime } from "@/lib/revenue-operations/revenue-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runRevenueAnalyticsRuntime({ deploymentId: "analytics-api" }));
}
