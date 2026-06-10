import { NextResponse } from "next/server";
import { runTokenRuntime } from "@/lib/ai-readiness/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runTokenRuntime({ deploymentId: "token-api" }));
}
