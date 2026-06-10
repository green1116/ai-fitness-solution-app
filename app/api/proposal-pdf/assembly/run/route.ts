import { NextResponse } from "next/server";
import { runProposalPdfAssemblyRuntime } from "@/lib/proposal-pdf/assembly";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalPdfAssemblyRuntime({ deploymentId: "assembly-api" }));
}
