import { NextResponse } from "next/server";
import { runCommercialDashboardRuntime } from "@/lib/commercial-delivery/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCommercialDashboardRuntime({ deploymentId: "dashboard-api" }));
}
