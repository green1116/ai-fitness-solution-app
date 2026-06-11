import { NextResponse } from "next/server";
import { runProposalVariantComposerRuntime } from "@/lib/bidder-proposal-composer/proposal-variant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalVariantComposerRuntime({ deploymentId: "proposal-variant-composer-api" }));
}
