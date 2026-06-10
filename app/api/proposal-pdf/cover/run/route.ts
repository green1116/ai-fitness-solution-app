import { NextResponse } from "next/server";
import { runProposalCoverRuntime } from "@/lib/proposal-pdf/cover";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalCoverRuntime({ deploymentId: "cover-api" }));
}
