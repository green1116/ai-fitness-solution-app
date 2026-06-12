import { NextResponse } from "next/server";
import { runProposalPersonalizationRuntime } from "@/lib/bidder-intelligence/proposal-personalization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalPersonalizationRuntime({ deploymentId: "proposal-personalization-api" }));
}
