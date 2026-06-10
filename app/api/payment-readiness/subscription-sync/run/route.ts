import { NextResponse } from "next/server";
import { runSubscriptionSyncRuntime } from "@/lib/payment-readiness/subscription-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.1 Subscription Sync Runtime API — readonly GET. */
export async function GET() {
  const result = runSubscriptionSyncRuntime({ deploymentId: "subscription-sync-api" });
  return NextResponse.json(result);
}
