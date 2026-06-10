import { NextResponse } from "next/server";
import { runRetryRuntime } from "@/lib/autopilot/retry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runRetryRuntime({ deploymentId: "retry-api" }));
}
