import { NextRequest, NextResponse } from "next/server";

import { TENDER_DECISION_RUNTIME_CONTRACT, runTenderDecisionRuntime } from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: TENDER_DECISION_RUNTIME_CONTRACT,
    pipeline: TENDER_DECISION_RUNTIME_CONTRACT.pipeline.join(" → "),
    statuses: ["recommended", "conditional", "high-risk", "rejected"],
  });
}

/** POST body: TenderDecisionRuntimeInput */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};
    if (!body.runId || !body.documentId) {
      return json(400, {
        ok: false,
        code: "CONTEXT_REQUIRED",
        message: "请提供 runId、documentId 及 coverage/validation/audit 结果",
      });
    }

    const decision = runTenderDecisionRuntime({
      runId: body.runId,
      documentId: body.documentId,
      coverageRuntime: body.coverageRuntime,
      tenderValidation: body.tenderValidation,
      tenderAudit: body.tenderAudit,
      linking: body.linking,
      policy: body.policy,
    });

    return json(200, { ok: true, decision });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "decision failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
