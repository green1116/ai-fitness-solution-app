import { NextResponse } from "next/server";
import { buildBidderProposalComposerReport } from "@/lib/bidder-proposal-composer/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(buildBidderProposalComposerReport({ deploymentId: "bidder-proposal-composer-report-api" }));
}
