import { NextResponse } from "next/server";
import { runBrandStrategyRuntime } from "@/lib/proposal-differentiation/brand-strategy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBrandStrategyRuntime({ deploymentId: "brand-strategy-api", bidderBrand: "Technogym" }));
}
