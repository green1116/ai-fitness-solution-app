import { NextResponse } from "next/server";
import { runInvoiceRuntime } from "@/lib/revenue-foundation/invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V10 Invoice Runtime API — readonly GET surface.
 */
export async function GET() {
  const result = runInvoiceRuntime({ deploymentId: "invoice-api" });
  return NextResponse.json(result);
}
