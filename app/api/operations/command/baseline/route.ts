import { buildCommandPlatformBaselineEndpoint } from "@/lib/operations/command/platform-baseline/baseline-endpoint";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V4-A5-FINAL-API Command Platform Baseline — readonly GET surface.
 * Exposes frozen manifest only; no command execution.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const deploymentId = url.searchParams.get("deploymentId") ?? undefined;
  const payload = buildCommandPlatformBaselineEndpoint({ deploymentId });
  return NextResponse.json(payload);
}
