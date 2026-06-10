import { NextResponse } from "next/server";
import { runPaymentGatewayRuntime } from "@/lib/payment-readiness/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.1 Payment Gateway Runtime API — readonly GET, no real payment calls. */
export async function GET() {
  const result = runPaymentGatewayRuntime({ deploymentId: "gateway-api" });
  return NextResponse.json(result);
}
