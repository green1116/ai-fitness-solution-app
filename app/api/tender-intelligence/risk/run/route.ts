import { NextResponse } from "next/server";
import { runRiskIntelligenceRuntime } from "@/lib/tender-intelligence/risk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runRiskIntelligenceRuntime({ deploymentId: "risk-api" }));
}
