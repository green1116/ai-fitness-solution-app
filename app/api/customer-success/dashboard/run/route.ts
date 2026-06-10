import { NextResponse } from "next/server";
import { runCustomerSuccessDashboardRuntime } from "@/lib/customer-success/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCustomerSuccessDashboardRuntime({ deploymentId: "dashboard-api" }));
}
