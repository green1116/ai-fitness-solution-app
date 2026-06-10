import { NextResponse } from "next/server";
import { runBillingRuntime } from "@/lib/revenue-foundation/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V10 Billing Runtime API — readonly GET surface.
 */
export async function GET() {
  const result = runBillingRuntime({ deploymentId: "billing-api" });
  return NextResponse.json(result);
}
