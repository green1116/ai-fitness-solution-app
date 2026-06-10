import { NextResponse } from "next/server";
import { runTrialRuntime } from "@/lib/revenue-foundation/trial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V10 Trial Runtime API — readonly GET surface.
 * Descriptive trial model only; no payment gateway.
 */
export async function GET() {
  const result = runTrialRuntime({ deploymentId: "trial-api" });
  return NextResponse.json(result);
}
