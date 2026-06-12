import { NextResponse } from "next/server";
import { runBidderProfileRuntime } from "@/lib/bidder-intelligence/bidder-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBidderProfileRuntime({ deploymentId: "bidder-profile-api" }));
}
