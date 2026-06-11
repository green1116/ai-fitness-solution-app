import { NextResponse } from "next/server";
import { runGtmAnalyticsRuntime } from "@/lib/go-to-market/gtm-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runGtmAnalyticsRuntime({ deploymentId: "analytics-api" }));
}
