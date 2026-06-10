import { NextResponse } from "next/server";
import { runWorkflowRuntime } from "@/lib/autopilot/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runWorkflowRuntime({ deploymentId: "workflow-api" }));
}
