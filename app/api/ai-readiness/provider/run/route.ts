import { NextResponse } from "next/server";
import { runAiProviderRuntime } from "@/lib/ai-readiness/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAiProviderRuntime({ deploymentId: "provider-api" }));
}
