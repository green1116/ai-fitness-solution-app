import { NextResponse } from "next/server";
import { runProposalQualityRuntime } from "@/lib/bidder-proposal-composer/proposal-quality";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalQualityRuntime({ deploymentId: "proposal-quality-api" }));
}
