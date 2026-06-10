import { NextResponse } from "next/server";
import { runSuccessAuditRuntime } from "@/lib/customer-success/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runSuccessAuditRuntime({ deploymentId: "audit-api" }));
}
