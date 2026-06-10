import { NextResponse } from "next/server";
import { runProjectKnowledgeRuntime } from "@/lib/knowledge-base/project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProjectKnowledgeRuntime({ deploymentId: "project-api" }));
}
