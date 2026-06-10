import { NextResponse } from "next/server";
import { runPromptRuntime } from "@/lib/ai-readiness/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runPromptRuntime({ deploymentId: "prompt-api" }));
}
