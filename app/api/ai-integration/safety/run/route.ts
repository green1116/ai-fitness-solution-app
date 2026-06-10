import { NextResponse } from "next/server";
import { runAiSafetyRuntime } from "@/lib/ai-integration/safety";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAiSafetyRuntime({ deploymentId: "safety-api" }));
}
