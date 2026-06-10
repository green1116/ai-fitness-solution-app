import { NextResponse } from "next/server";
import { runGtmDashboardRuntime } from "@/lib/go-to-market/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runGtmDashboardRuntime({ deploymentId: "dashboard-api" }));
}
