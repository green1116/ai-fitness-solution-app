import { NextResponse } from "next/server";
import { runModelRoutingRuntime } from "@/lib/ai-integration/model-routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runModelRoutingRuntime({ deploymentId: "routing-api" }));
}
