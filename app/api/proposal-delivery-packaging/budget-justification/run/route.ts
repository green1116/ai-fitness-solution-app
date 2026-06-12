import { NextResponse } from "next/server";
import { runBudgetJustificationRuntime } from "@/lib/proposal-delivery-packaging/budget-justification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBudgetJustificationRuntime({ deploymentId: "budget-justification-api" }));
}
