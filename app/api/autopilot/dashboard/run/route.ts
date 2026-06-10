import { NextResponse } from "next/server";
import { runAutopilotDashboardRuntime } from "@/lib/autopilot/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAutopilotDashboardRuntime({ deploymentId: "dashboard-api" }));
}
