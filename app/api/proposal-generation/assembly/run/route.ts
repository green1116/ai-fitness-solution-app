import { NextResponse } from "next/server";
import { runProposalAssemblyRuntime } from "@/lib/proposal-generation/assembly";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalAssemblyRuntime({ deploymentId: "assembly-api" }));
}
