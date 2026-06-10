import { NextResponse } from "next/server";
import { runTrialOperationsRuntime } from "@/lib/revenue-operations/trial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runTrialOperationsRuntime({ deploymentId: "trial-api" }));
}
