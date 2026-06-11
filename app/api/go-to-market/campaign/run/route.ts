import { NextResponse } from "next/server";
import { runCampaignRuntime } from "@/lib/go-to-market/campaign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCampaignRuntime({ deploymentId: "campaign-api" }));
}
