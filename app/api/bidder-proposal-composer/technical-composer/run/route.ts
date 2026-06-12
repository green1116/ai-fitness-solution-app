import { NextResponse } from "next/server";
import { runTechnicalComposerRuntime } from "@/lib/bidder-proposal-composer/technical-composer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runTechnicalComposerRuntime({ deploymentId: "technical-composer-api" }));
}
