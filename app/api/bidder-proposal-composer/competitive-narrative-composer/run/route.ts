import { NextResponse } from "next/server";
import { runCompetitiveNarrativeComposerRuntime } from "@/lib/bidder-proposal-composer/competitive-narrative";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCompetitiveNarrativeComposerRuntime({ deploymentId: "competitive-narrative-composer-api" }));
}
