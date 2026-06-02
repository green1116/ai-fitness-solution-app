import { NextRequest, NextResponse } from "next/server";

import {
  RUNTIME_CORRELATION_INTELLIGENCE_CONTRACT,
  runExternalEvidenceRuntime,
  runRuntimeCorrelationIntelligence,
  runtimeCorrelationInputFromSuccess,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: RUNTIME_CORRELATION_INTELLIGENCE_CONTRACT,
    pipeline: RUNTIME_CORRELATION_INTELLIGENCE_CONTRACT.pipeline.join(" → "),
    nodeTypes: [
      "coverage",
      "validation",
      "audit",
      "governance",
      "ocr",
      "executive",
      "gate",
      "release",
    ],
    impacts: ["low", "moderate", "high", "critical"],
  });
}

/** POST — 传入各层 runtime 结果，或 text 跑完整 pipeline 后关联 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};

    if (body.runId && (body.executiveApprovalGate || body.tenderGovernance)) {
      const correlation = runRuntimeCorrelationIntelligence({
        runId: body.runId,
        coverageRuntime: body.coverageRuntime,
        tenderValidation: body.tenderValidation,
        tenderAudit: body.tenderAudit,
        tenderDecision: body.tenderDecision,
        tenderGovernance: body.tenderGovernance,
        executiveOversight: body.executiveOversight,
        executiveApprovalGate: body.executiveApprovalGate,
        executiveReleaseSurface: body.executiveReleaseSurface,
        linking: body.linking,
        ocrDocuments: body.ocrDocuments,
      });
      return json(200, { ok: true, correlation });
    }

    const text = String(body.text || body.tenderRawText || "").trim();
    if (!text) {
      return json(400, {
        ok: false,
        code: "CONTEXT_REQUIRED",
        message: "请提供 runId+runtime 上下文，或 text/tenderRawText",
      });
    }

    const runtime = await runExternalEvidenceRuntime({
      attachments: [
        {
          buffer: Buffer.from(text, "utf8"),
          fileName: body.fileName || "tender.txt",
          mimeType: "text/plain",
        },
      ],
      requirementItems: body.requirementItems ?? [
        {
          id: "req-corr-1",
          title: "招标文件证据",
          text: text.slice(0, 500),
          keywords: ["招标", "投标", "资质"],
          mandatory: true,
          category: "qualification" as const,
        },
      ],
      tenderDocument: {
        documentId: body.documentId || `corr-${Date.now()}`,
        tenderTitle: body.tenderTitle || "Correlation Intelligence",
      },
    });

    if (!runtime.ok) {
      return json(422, runtime);
    }

    const correlation =
      runtime.runtimeCorrelation ??
      runRuntimeCorrelationIntelligence({
        runId: runtime.runId,
        ...runtimeCorrelationInputFromSuccess(runtime),
      });

    return json(200, {
      ok: true,
      runtime: { runId: runtime.runId },
      correlation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "correlation failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
