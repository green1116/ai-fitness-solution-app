import { NextResponse } from "next/server";
import { runKnowledgeSearchRuntime } from "@/lib/knowledge-base/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runKnowledgeSearchRuntime({ deploymentId: "search-api" }));
}
