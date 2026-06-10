import { NextResponse } from "next/server";
import { runProposalKnowledgeRuntime } from "@/lib/knowledge-base/proposal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalKnowledgeRuntime({ deploymentId: "proposal-api" }));
}
