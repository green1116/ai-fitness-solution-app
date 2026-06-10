import { NextResponse } from "next/server";
import { runMarketSegmentRuntime } from "@/lib/go-to-market/market-segment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runMarketSegmentRuntime({ deploymentId: "segment-api" }));
}
