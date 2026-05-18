import { NextRequest, NextResponse } from "next/server";

import {
  EXECUTIVE_RUNTIME_VISUALIZATION_CONTRACT,
  runExecutiveRuntimeVisualization,
  runExternalEvidenceRuntime,
  runtimeVisualizationInputFromSuccess,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: EXECUTIVE_RUNTIME_VISUALIZATION_CONTRACT,
    pipeline: EXECUTIVE_RUNTIME_VISUALIZATION_CONTRACT.pipeline.join(" → "),
    metricStatuses: ["healthy", "warning", "critical"],
  });
}

/**
 * POST — 方式 A：传入完整 evidence runtime 子结果构建 visualization
 * 方式 B：传入 text + requirementItems 跑完整 pipeline 后可视化
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};

    if (body.executiveApprovalGate && body.runId) {
      const visualization = runExecutiveRuntimeVisualization({
        runId: body.runId,
        documentId: body.documentId || body.runId,
        executiveApprovalGate: body.executiveApprovalGate,
        executiveOversight: body.executiveOversight,
        executiveReleaseSurface: body.executiveReleaseSurface,
        coverageRuntime: body.coverageRuntime,
        tenderValidation: body.tenderValidation,
        tenderAudit: body.tenderAudit,
        tenderDecision: body.tenderDecision,
        tenderGovernance: body.tenderGovernance,
        linking: body.linking,
        ocrDocuments: body.ocrDocuments,
      });
      return json(200, { ok: true, visualization });
    }

    const text = String(body.text || body.tenderRawText || "").trim();
    if (!text) {
      return json(400, {
        ok: false,
        code: "CONTEXT_REQUIRED",
        message: "请提供 runId+executiveApprovalGate，或 text/tenderRawText 以运行完整 pipeline",
      });
    }

    const requirementItems =
      body.requirementItems ??
      [
        {
          id: "req-exec-viz-1",
          title: "招标文件证据",
          text: text.slice(0, 500),
          keywords: ["招标", "投标", "资质", "ISO"],
          mandatory: true,
          category: "qualification" as const,
        },
      ];

    const runtime = await runExternalEvidenceRuntime({
      attachments: [
        {
          buffer: Buffer.from(text, "utf8"),
          fileName: body.fileName || "tender.txt",
          mimeType: "text/plain",
        },
      ],
      requirementItems,
      tenderDocument: {
        documentId: body.documentId || `viz-${Date.now()}`,
        tenderTitle: body.tenderTitle || "Executive Dashboard",
      },
    });

    if (!runtime.ok) {
      return json(422, runtime);
    }

    const visualization = runExecutiveRuntimeVisualization({
      runId: runtime.runId,
      ...runtimeVisualizationInputFromSuccess(runtime),
    });

    return json(200, {
      ok: true,
      runtime: {
        runId: runtime.runId,
        executiveScore: visualization.executiveScore,
        releasable: visualization.releasable,
      },
      visualization,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "visualization failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
