import { NextRequest, NextResponse } from "next/server";

import {
  EXECUTIVE_RELEASE_SURFACE_RUNTIME_CONTRACT,
  runExecutiveReleaseSurfaceRuntime,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: EXECUTIVE_RELEASE_SURFACE_RUNTIME_CONTRACT,
    pipeline: EXECUTIVE_RELEASE_SURFACE_RUNTIME_CONTRACT.pipeline.join(" → "),
    surfaceStatuses: ["approved", "conditional", "blocked"],
    decisions: ["release", "conditional-release", "block-release"],
  });
}

/** POST body: ExecutiveReleaseSurfaceRuntimeInput */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};
    if (!body.runId || !body.documentId || !body.executiveApprovalGate) {
      return json(400, {
        ok: false,
        code: "CONTEXT_REQUIRED",
        message: "请提供 runId、documentId 及 executiveApprovalGate 结果",
      });
    }

    const surface = runExecutiveReleaseSurfaceRuntime({
      runId: body.runId,
      documentId: body.documentId,
      executiveApprovalGate: body.executiveApprovalGate,
      executiveOversight: body.executiveOversight,
      extensions: body.extensions,
    });

    return json(200, { ok: true, surface });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "release surface failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
