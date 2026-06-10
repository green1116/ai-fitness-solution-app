import { NextResponse } from "next/server";
import { runAutopilotJobRuntime } from "@/lib/autopilot/job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAutopilotJobRuntime({ deploymentId: "job-api" }));
}
