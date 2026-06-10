import { NextResponse } from "next/server";
import { runWebhookContractRuntime } from "@/lib/payment-readiness/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.1 Webhook Contract Runtime API — readonly GET. */
export async function GET() {
  const result = runWebhookContractRuntime({ deploymentId: "webhook-api" });
  return NextResponse.json(result);
}
