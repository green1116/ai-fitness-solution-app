import { NextResponse } from "next/server";
import { runCompetitiveAdvantageRuntime } from "@/lib/proposal-differentiation/competitive-advantage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCompetitiveAdvantageRuntime({ deploymentId: "competitive-advantage-api", bidderBrand: "Technogym" }));
}
