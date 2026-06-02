import { NextRequest, NextResponse } from "next/server";

import { TENDER_GOVERNANCE_RUNTIME_CONTRACT, runTenderGovernanceRuntime } from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: TENDER_GOVERNANCE_RUNTIME_CONTRACT,
    pipeline: TENDER_GOVERNANCE_RUNTIME_CONTRACT.pipeline.join(" → "),
    riskLevels: ["low", "medium", "high", "critical"],
    postures: ["proceed", "escalate", "hold", "halt"],
  });
}

/** POST body: TenderGovernanceRuntimeInput */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};
    if (!body.runId || !body.documentId) {
      return json(400, {
        ok: false,
        code: "CONTEXT_REQUIRED",
        message: "请提供 runId、documentId 及 decision/coverage/validation/audit 结果",
      });
    }

    const governance = runTenderGovernanceRuntime({
      runId: body.runId,
      documentId: body.documentId,
      coverageRuntime: body.coverageRuntime,
      tenderValidation: body.tenderValidation,
      tenderAudit: body.tenderAudit,
      tenderDecision: body.tenderDecision,
      policy: body.policy,
    });

    return json(200, { ok: true, governance });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "governance failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
