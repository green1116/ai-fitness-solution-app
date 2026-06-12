import { NextResponse } from "next/server";
import { runBidderProposalDashboardRuntime } from "@/lib/bidder-proposal-composer/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBidderProposalDashboardRuntime({ deploymentId: "bidder-proposal-dashboard-api" }));
}
