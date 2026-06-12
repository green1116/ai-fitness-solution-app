import { NextResponse } from "next/server";
import { runBudgetMappingRuntime } from "@/lib/brand-catalog-intelligence/budget-mapping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBudgetMappingRuntime({ deploymentId: "budget-mapping-api" }));
}
