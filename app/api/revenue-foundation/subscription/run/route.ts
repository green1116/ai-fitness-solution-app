import { NextResponse } from "next/server";
import { runSubscriptionRuntime } from "@/lib/revenue-foundation/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V10 Subscription Runtime API — readonly GET surface.
 */
export async function GET() {
  const result = runSubscriptionRuntime({ deploymentId: "subscription-api" });
  return NextResponse.json(result);
}
