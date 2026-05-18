import { NextRequest, NextResponse } from "next/server";

import {
  EXECUTIVE_APPROVAL_GATE_RUNTIME_CONTRACT,
  runExecutiveApprovalGateRuntime,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: EXECUTIVE_APPROVAL_GATE_RUNTIME_CONTRACT,
    pipeline: EXECUTIVE_APPROVAL_GATE_RUNTIME_CONTRACT.pipeline.join(" → "),
    gateStatuses: ["approved", "conditional", "blocked"],
    recommendations: ["release", "conditional-release", "block-release"],
    releaseDecisions: ["release-authorized", "release-held", "release-denied"],
  });
}

/** POST body: ExecutiveApprovalGateRuntimeInput */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};
    if (!body.runId || !body.documentId || !body.executiveOversight) {
      return json(400, {
        ok: false,
        code: "CONTEXT_REQUIRED",
        message: "请提供 runId、documentId 及 executiveOversight 结果",
      });
    }

    const gate = runExecutiveApprovalGateRuntime({
      runId: body.runId,
      documentId: body.documentId,
      executiveOversight: body.executiveOversight,
      coverageRuntime: body.coverageRuntime,
      tenderValidation: body.tenderValidation,
      tenderAudit: body.tenderAudit,
      tenderDecision: body.tenderDecision,
      tenderGovernance: body.tenderGovernance,
      linking: body.linking,
      ocrDocuments: body.ocrDocuments,
      policy: body.policy,
      extensions: body.extensions,
    });

    return json(200, { ok: true, gate });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "executive gate failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
