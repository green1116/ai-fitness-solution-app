import { NextResponse } from "next/server";
import { runRevenueDashboardRuntime } from "@/lib/revenue-foundation/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V10 Revenue Dashboard Runtime API — readonly GET surface.
 */
export async function GET() {
  const result = runRevenueDashboardRuntime({ deploymentId: "dashboard-api" });
  return NextResponse.json(result);
}
