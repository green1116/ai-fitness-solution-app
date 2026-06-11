import { NextResponse } from "next/server";
import { buildProposalDifferentiationReport } from "@/lib/proposal-differentiation/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(buildProposalDifferentiationReport({ deploymentId: "report-api" }));
}
