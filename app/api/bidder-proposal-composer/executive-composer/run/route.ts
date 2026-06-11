import { NextResponse } from "next/server";
import { runExecutiveComposerRuntime } from "@/lib/bidder-proposal-composer/executive-composer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runExecutiveComposerRuntime({ deploymentId: "executive-composer-api" }));
}
