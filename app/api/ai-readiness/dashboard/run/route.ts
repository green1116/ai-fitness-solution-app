import { NextResponse } from "next/server";
import { runAiReadinessDashboardRuntime } from "@/lib/ai-readiness/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAiReadinessDashboardRuntime({ deploymentId: "dashboard-api" }));
}
