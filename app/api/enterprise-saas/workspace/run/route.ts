import { NextResponse } from "next/server";
import { runWorkspaceRuntime } from "@/lib/enterprise-saas/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.5 Workspace Runtime API — readonly GET. */
export async function GET() {
  return NextResponse.json(runWorkspaceRuntime({ deploymentId: "workspace-api" }));
}
