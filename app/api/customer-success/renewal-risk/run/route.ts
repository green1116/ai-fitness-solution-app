import { NextResponse } from "next/server";
import { runRenewalRiskRuntime } from "@/lib/customer-success/renewal-risk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runRenewalRiskRuntime({ deploymentId: "renewal-risk-api" }));
}
