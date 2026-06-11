import { NextResponse } from "next/server";
import { runValuePropositionRuntime } from "@/lib/proposal-differentiation/value-proposition";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runValuePropositionRuntime({ deploymentId: "value-proposition-api", bidderBrand: "Technogym" }));
}
