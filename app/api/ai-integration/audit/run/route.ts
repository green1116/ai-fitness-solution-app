import { NextResponse } from "next/server";
import { runAiAuditRuntime } from "@/lib/ai-integration/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAiAuditRuntime({ deploymentId: "audit-api" }));
}
