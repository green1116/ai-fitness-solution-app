import { NextResponse } from "next/server";
import { runBrandIntelligenceRuntime } from "@/lib/brand-catalog-intelligence/brand-intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBrandIntelligenceRuntime({ deploymentId: "brand-intelligence-api" }));
}
