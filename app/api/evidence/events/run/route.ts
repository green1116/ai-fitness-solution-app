import { NextRequest, NextResponse } from "next/server";

import {
  RUNTIME_EVENT_ORCHESTRATION_VERSION,
  RUNTIME_EVENT_TYPES,
  runExternalEvidenceRuntime,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    version: RUNTIME_EVENT_ORCHESTRATION_VERSION,
    eventTypes: RUNTIME_EVENT_TYPES,
    coreChains: [
      "OCR_COMPLETED → COVERAGE_RE_EVALUATED → VALIDATION_RECHECKED",
      "VALIDATION_FAILED → GOVERNANCE_ESCALATED → RELEASE_BLOCKED",
      "AUDIT_APPROVED → EXECUTIVE_REVIEW_UNLOCKED",
      "GOVERNANCE_APPROVED → RELEASE_ENABLED",
      "EXECUTIVE_APPROVED → MANIFEST_GENERATION_REQUESTED",
    ],
  });
}

/** POST — 跑完整 pipeline 并返回事件编排轨迹 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};
    const text = String(body.text || body.tenderRawText || "").trim();
    if (!text) {
      return json(400, {
        ok: false,
        code: "TEXT_REQUIRED",
        message: "请提供 text 或 tenderRawText",
      });
    }

    const runtimeResult = await runExternalEvidenceRuntime({
      attachments: [
        {
          buffer: Buffer.from(text, "utf8"),
          fileName: body.fileName || "tender.txt",
          mimeType: "text/plain",
        },
      ],
      requirementItems: body.requirementItems ?? [
        {
          id: "req-evt-1",
          title: "招标文件",
          text: text.slice(0, 500),
          keywords: ["招标", "投标"],
          mandatory: true,
          category: "qualification" as const,
        },
      ],
      tenderDocument: {
        documentId: body.documentId || `evt-${Date.now()}`,
        tenderTitle: body.tenderTitle || "Event Orchestration",
      },
      correlationId: body.correlationId,
      jobId: body.jobId,
      planId: body.planId,
      tenderId: body.tenderId,
    });

    if (!runtimeResult.ok) {
      return json(422, runtimeResult);
    }

    return json(200, {
      ok: true,
      runId: runtimeResult.runId,
      orchestration: runtimeResult.runtimeEventOrchestration,
      replay: runtimeResult.runtimeEventOrchestration?.records.map((r) => r.eventType),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "event orchestration failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
