import { NextResponse } from "next/server";
import { runBudgetPackageRuntime } from "@/lib/equipment-selection/budget-package";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBudgetPackageRuntime({ deploymentId: "budget-package-api" }));
}
