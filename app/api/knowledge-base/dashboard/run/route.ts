import { NextResponse } from "next/server";
import { runKnowledgeDashboardRuntime } from "@/lib/knowledge-base/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runKnowledgeDashboardRuntime({ deploymentId: "dashboard-api" }));
}
