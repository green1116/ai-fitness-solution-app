import { NextResponse } from "next/server";
import { runProposalDifferentiationRuntime } from "@/lib/proposal-differentiation/differentiation-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalDifferentiationRuntime({ deploymentId: "proposal-differentiation-api" }));
}
