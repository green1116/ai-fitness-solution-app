import { NextResponse } from "next/server";
import { runStageOrchestrationRuntime } from "@/lib/autopilot/stage-orchestration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runStageOrchestrationRuntime({ deploymentId: "orchestration-api" }));
}
