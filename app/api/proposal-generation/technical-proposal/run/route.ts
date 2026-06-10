import { NextResponse } from "next/server";
import { runTechnicalProposalRuntime } from "@/lib/proposal-generation/technical-proposal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runTechnicalProposalRuntime({ deploymentId: "technical-proposal-api" }));
}
