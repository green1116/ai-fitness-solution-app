import { NextRequest, NextResponse } from "next/server";

import {
  RUNTIME_STATE_MACHINE_CONTRACT,
  runExternalEvidenceRuntime,
  runRuntimeStateMachine,
  runtimeStateMachineInputFromSuccess,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: RUNTIME_STATE_MACHINE_CONTRACT,
    pipeline: RUNTIME_STATE_MACHINE_CONTRACT.pipeline.join(" → "),
    lifecycleStates: [
      "draft",
      "evidence-pending",
      "ocr-verified",
      "coverage-passed",
      "validation-passed",
      "audit-reviewed",
      "governance-approved",
      "executive-approved",
      "release-approved",
      "released",
      "conditional-release",
      "release-blocked",
      "executive-escalation",
    ],
  });
}

/** POST — 传入完整 runtime 上下文，或 text 跑 pipeline 后推导状态机 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};

    if (body.runId && (body.runtimePolicy || body.executiveApprovalGate)) {
      const stateMachine = runRuntimeStateMachine({
        runId: body.runId,
        ranAt: body.ranAt,
        coverageRuntime: body.coverageRuntime,
        tenderValidation: body.tenderValidation,
        tenderAudit: body.tenderAudit,
        tenderDecision: body.tenderDecision,
        tenderGovernance: body.tenderGovernance,
        executiveOversight: body.executiveOversight,
        executiveApprovalGate: body.executiveApprovalGate,
        executiveReleaseSurface: body.executiveReleaseSurface,
        runtimeCorrelation: body.runtimeCorrelation,
        runtimePolicy: body.runtimePolicy,
        linking: body.linking,
        ocrDocuments: body.ocrDocuments,
        attachmentCount: body.attachmentCount,
      });
      return json(200, { ok: true, stateMachine });
    }

    const text = String(body.text || body.tenderRawText || "").trim();
    if (!text) {
      return json(400, {
        ok: false,
        code: "CONTEXT_REQUIRED",
        message: "请提供 runtime 上下文或 text/tenderRawText",
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
          id: "req-fsm-1",
          title: "招标文件",
          text: text.slice(0, 500),
          keywords: ["招标", "投标"],
          mandatory: true,
          category: "qualification" as const,
        },
      ],
      tenderDocument: {
        documentId: body.documentId || `fsm-${Date.now()}`,
        tenderTitle: body.tenderTitle || "State Machine",
      },
    });

    if (!runtimeResult.ok) {
      return json(422, runtimeResult);
    }

    const stateMachine =
      runtimeResult.runtimeStateMachine ??
      runRuntimeStateMachine({
        runId: runtimeResult.runId,
        ...runtimeStateMachineInputFromSuccess(runtimeResult),
        attachmentCount: runtimeResult.attachments.length,
      });

    return json(200, {
      ok: true,
      runtime: { runId: runtimeResult.runId },
      stateMachine,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "state machine failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
