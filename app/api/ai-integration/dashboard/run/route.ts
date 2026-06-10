import { NextResponse } from "next/server";
import { runAiGenerationDashboardRuntime } from "@/lib/ai-integration/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAiGenerationDashboardRuntime({ deploymentId: "dashboard-api" }));
}
