import { NextResponse } from "next/server";
import { runModelRuntime } from "@/lib/ai-readiness/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runModelRuntime({ deploymentId: "model-api" }));
}
