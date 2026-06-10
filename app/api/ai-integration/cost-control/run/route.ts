import { NextResponse } from "next/server";
import { runAiCostControlRuntime } from "@/lib/ai-integration/cost-control";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAiCostControlRuntime({ deploymentId: "cost-api" }));
}
