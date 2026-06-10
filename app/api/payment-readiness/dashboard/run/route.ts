import { NextResponse } from "next/server";
import { runPaymentReadinessDashboardRuntime } from "@/lib/payment-readiness/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.1 Payment Readiness Dashboard API — readonly GET. */
export async function GET() {
  const result = runPaymentReadinessDashboardRuntime({ deploymentId: "dashboard-api" });
  return NextResponse.json(result);
}
