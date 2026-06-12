import { NextResponse } from "next/server";
import { runTenderResponseDashboardRuntime } from "@/lib/tender-response-pack/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runTenderResponseDashboardRuntime({ deploymentId: "tender-response-dashboard-api" }));
}
