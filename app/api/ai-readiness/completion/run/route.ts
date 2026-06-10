import { NextResponse } from "next/server";
import { runCompletionRuntime } from "@/lib/ai-readiness/completion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCompletionRuntime({ deploymentId: "completion-api" }));
}
