import { NextResponse } from "next/server";
import { buildTrialWorkspaceResponse } from "@/lib/productization/trial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V8.4 Trial Workspace API — readonly GET surface.
 * Returns workspace, entitlements, usage, and summary.
 */
export async function GET() {
  const response = buildTrialWorkspaceResponse({ deploymentId: "trial-workspace-api" });
  return NextResponse.json({
    workspace: response.workspace,
    entitlements: response.entitlements,
    usage: response.usage,
    summary: response.summary,
  });
}
