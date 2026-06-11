import { NextResponse } from "next/server";
import { runBrandComparisonRuntime } from "@/lib/brand-catalog-intelligence/brand-comparison";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBrandComparisonRuntime({ deploymentId: "brand-comparison-api" }));
}
