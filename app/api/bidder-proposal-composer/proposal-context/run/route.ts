import { NextResponse } from "next/server";
import { runProposalContextRuntime } from "@/lib/bidder-proposal-composer/proposal-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalContextRuntime({ deploymentId: "proposal-context-api" }));
}
