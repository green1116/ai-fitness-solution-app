import { NextResponse } from "next/server";
import { runRiskKnowledgeRuntime } from "@/lib/knowledge-base/risk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runRiskKnowledgeRuntime({ deploymentId: "risk-api" }));
}
