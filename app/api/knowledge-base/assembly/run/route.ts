import { NextResponse } from "next/server";
import { runKnowledgeAssemblyRuntime } from "@/lib/knowledge-base/assembly";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runKnowledgeAssemblyRuntime({ deploymentId: "assembly-api" }));
}
