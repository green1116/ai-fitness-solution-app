import { NextResponse } from "next/server";
import { runAutopilotAuditRuntime } from "@/lib/autopilot/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAutopilotAuditRuntime({ deploymentId: "audit-api" }));
}
