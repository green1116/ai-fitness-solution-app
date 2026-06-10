import { NextResponse } from "next/server";
import { runPromptOrchestrationRuntime } from "@/lib/ai-integration/prompt-orchestration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runPromptOrchestrationRuntime({ deploymentId: "prompt-api" }));
}
