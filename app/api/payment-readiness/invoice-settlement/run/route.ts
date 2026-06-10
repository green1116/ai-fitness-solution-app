import { NextResponse } from "next/server";
import { runInvoiceSettlementRuntime } from "@/lib/payment-readiness/invoice-settlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.1 Invoice Settlement Runtime API — readonly GET. */
export async function GET() {
  const result = runInvoiceSettlementRuntime({ deploymentId: "invoice-settlement-api" });
  return NextResponse.json(result);
}
