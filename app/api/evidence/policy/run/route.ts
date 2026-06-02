import { NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_ENTERPRISE_RUNTIME_POLICIES,
  RUNTIME_POLICY_ENGINE_CONTRACT,
  runExternalEvidenceRuntime,
  runRuntimePolicyEngine,
  runtimePolicyInputFromSuccess,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: RUNTIME_POLICY_ENGINE_CONTRACT,
    pipeline: RUNTIME_POLICY_ENGINE_CONTRACT.pipeline.join(" → "),
    defaultPolicyCount: DEFAULT_ENTERPRISE_RUNTIME_POLICIES.length,
    actions: [
      "block-release",
      "conditional-release",
      "require-executive-review",
      "raise-governance-warning",
      "raise-audit-warning",
    ],
  });
}

/** POST — 传入 runtime 上下文评估 policy，或 text 跑全 pipeline */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};

    if (body.runId && (body.executiveApprovalGate || body.tenderGovernance)) {
      const policy = runRuntimePolicyEngine({
        runId: body.runId,
        policies: body.policies,
        coverageRuntime: body.coverageRuntime,
        tenderValidation: body.tenderValidation,
        tenderAudit: body.tenderAudit,
        tenderDecision: body.tenderDecision,
        tenderGovernance: body.tenderGovernance,
        executiveOversight: body.executiveOversight,
        executiveApprovalGate: body.executiveApprovalGate,
        executiveReleaseSurface: body.executiveReleaseSurface,
        runtimeCorrelation: body.runtimeCorrelation,
        linking: body.linking,
        ocrDocuments: body.ocrDocuments,
      });
      return json(200, { ok: true, policy });
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
          id: "req-pol-1",
          title: "招标文件证据",
          text: text.slice(0, 500),
          keywords: ["招标", "投标"],
          mandatory: true,
          category: "qualification" as const,
        },
      ],
      tenderDocument: {
        documentId: body.documentId || `pol-${Date.now()}`,
        tenderTitle: body.tenderTitle || "Policy Engine",
      },
    });

    if (!runtimeResult.ok) {
      return json(422, runtimeResult);
    }

    const policy =
      runtimeResult.runtimePolicy ??
      runRuntimePolicyEngine({
        runId: runtimeResult.runId,
        ...runtimePolicyInputFromSuccess(runtimeResult, body.policies),
      });

    return json(200, {
      ok: true,
      runtime: { runId: runtimeResult.runId },
      policy,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "policy engine failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
