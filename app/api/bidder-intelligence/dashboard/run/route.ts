import { NextResponse } from "next/server";
import { runBidderDashboardRuntime } from "@/lib/bidder-intelligence/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBidderDashboardRuntime({ deploymentId: "bidder-dashboard-api" }));
}
