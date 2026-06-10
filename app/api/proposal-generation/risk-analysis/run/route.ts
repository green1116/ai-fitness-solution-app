import { NextResponse } from "next/server";
import { runRiskAnalysisRuntime } from "@/lib/proposal-generation/risk-analysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runRiskAnalysisRuntime({ deploymentId: "risk-analysis-api" }));
}
