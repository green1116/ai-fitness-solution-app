import { NextResponse } from "next/server";
import { runTenderIntelligenceAssemblyRuntime } from "@/lib/tender-intelligence/assembly";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runTenderIntelligenceAssemblyRuntime({ deploymentId: "assembly-api" }));
}
