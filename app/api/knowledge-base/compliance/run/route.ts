import { NextResponse } from "next/server";
import { runComplianceKnowledgeRuntime } from "@/lib/knowledge-base/compliance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runComplianceKnowledgeRuntime({ deploymentId: "compliance-api" }));
}
