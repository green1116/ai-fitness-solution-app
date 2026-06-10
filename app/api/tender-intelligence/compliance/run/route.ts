import { NextResponse } from "next/server";
import { runComplianceIntelligenceRuntime } from "@/lib/tender-intelligence/compliance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runComplianceIntelligenceRuntime({ deploymentId: "compliance-api" }));
}
