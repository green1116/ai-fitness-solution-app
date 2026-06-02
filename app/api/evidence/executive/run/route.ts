import { NextRequest, NextResponse } from "next/server";

import {
  EXECUTIVE_OVERSIGHT_RUNTIME_CONTRACT,
  runExecutiveOversightRuntime,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: EXECUTIVE_OVERSIGHT_RUNTIME_CONTRACT,
    pipeline: EXECUTIVE_OVERSIGHT_RUNTIME_CONTRACT.pipeline.join(" → "),
    riskLevels: ["acceptable", "attention", "high", "critical"],
    recommendations: ["approve", "conditional-approve", "review-required", "reject"],
    verdicts: ["approve", "approve_with_conditions", "defer", "deny"],
  });
}

/** POST body: ExecutiveOversightRuntimeInput */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};
    if (!body.runId || !body.documentId) {
      return json(400, {
        ok: false,
        code: "CONTEXT_REQUIRED",
        message: "请提供 runId、documentId 及 governance 等上游结果",
      });
    }

    const executive = runExecutiveOversightRuntime({
      runId: body.runId,
      documentId: body.documentId,
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

    return json(200, { ok: true, executive });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "executive oversight failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
