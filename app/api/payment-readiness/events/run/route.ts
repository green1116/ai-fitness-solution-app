import { NextResponse } from "next/server";
import { runPaymentEventsRuntime } from "@/lib/payment-readiness/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.1 Payment Event Runtime API — readonly GET. */
export async function GET() {
  const result = runPaymentEventsRuntime({ deploymentId: "events-api" });
  return NextResponse.json(result);
}
