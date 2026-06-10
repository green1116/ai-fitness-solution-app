import { NextResponse } from "next/server";
import { runAiKnowledgeFusionRuntime } from "@/lib/ai-integration/knowledge-fusion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAiKnowledgeFusionRuntime({ deploymentId: "fusion-api" }));
}
