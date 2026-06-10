import { NextResponse } from "next/server";
import { runProposalSectionRuntime } from "@/lib/proposal-pdf/sections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalSectionRuntime({ deploymentId: "sections-api" }));
}
