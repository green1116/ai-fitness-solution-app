import { NextRequest, NextResponse } from "next/server";

import { TENDER_AUDIT_RUNTIME_CONTRACT, runTenderAuditRuntime } from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: TENDER_AUDIT_RUNTIME_CONTRACT,
    pipeline: TENDER_AUDIT_RUNTIME_CONTRACT.pipeline.join(" → "),
    eventTypes: [
      "requirement-linked",
      "coverage-evaluated",
      "validation-issued",
      "ocr-trace-created",
      "evidence-matched",
      "compliance-flagged",
    ],
  });
}

/** POST body: TenderAuditRuntimeInput fields */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};
    if (!body.runId || !body.documentId) {
      return json(400, {
        ok: false,
        code: "RUN_CONTEXT_REQUIRED",
        message: "请提供 runId、documentId 及上游运行时结果",
      });
    }

    const audit = runTenderAuditRuntime({
      runId: body.runId,
      documentId: body.documentId,
      startedAt: body.startedAt || new Date().toISOString(),
      requirements: body.requirements || [],
      attachments: body.attachments,
      ocrDocuments: body.ocrDocuments,
      linking: body.linking,
      coverageRuntime: body.coverageRuntime,
      tenderValidation: body.tenderValidation,
      registry: body.registry,
      orchestrationTrace: body.orchestrationTrace,
    });

    return json(200, { ok: true, audit });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "audit failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
