import { NextResponse } from "next/server";
import { runBudgetStrategyRuntime } from "@/lib/proposal-differentiation/budget-strategy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBudgetStrategyRuntime({ deploymentId: "budget-strategy-api", bidderBrand: "Technogym" }));
}
