import { NextResponse } from "next/server";
import { runImplementationPlanRuntime } from "@/lib/proposal-generation/implementation-plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runImplementationPlanRuntime({ deploymentId: "implementation-plan-api" }));
}
