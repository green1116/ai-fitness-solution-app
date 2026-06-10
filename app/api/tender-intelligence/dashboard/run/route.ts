import { NextResponse } from "next/server";
import { runTenderDashboardRuntime } from "@/lib/tender-intelligence/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runTenderDashboardRuntime({ deploymentId: "dashboard-api" }));
}
