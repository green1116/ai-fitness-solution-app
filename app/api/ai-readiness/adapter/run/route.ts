import { NextResponse } from "next/server";
import { runAiAdapterRuntime } from "@/lib/ai-readiness/adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAiAdapterRuntime({ deploymentId: "adapter-api" }));
}
