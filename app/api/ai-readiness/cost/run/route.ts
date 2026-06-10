import { NextResponse } from "next/server";
import { runCostRuntime } from "@/lib/ai-readiness/cost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCostRuntime({ deploymentId: "cost-api" }));
}
