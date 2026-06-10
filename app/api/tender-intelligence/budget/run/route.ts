import { NextResponse } from "next/server";
import { runBudgetIntelligenceRuntime } from "@/lib/tender-intelligence/budget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBudgetIntelligenceRuntime({ deploymentId: "budget-api" }));
}
