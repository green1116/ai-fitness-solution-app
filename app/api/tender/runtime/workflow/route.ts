import { NextRequest, NextResponse } from "next/server";

import { analyzeTender } from "@/lib/tender/analyzeTender";
import { runTenderRuntimeWorkflow } from "@/lib/tender/runtime/workflow";
import type { TenderRuntimeWorkflowInput } from "@/lib/tender/runtime/workflow/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V2.9 Tender Runtime Workflow API
 *
 * POST { rawText?, graph?, mode?, forceAllow?, gatePolicy?, evidencePolicy?, skipSteps? }
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return json(400, {
          ok: false,
          code: "FILE_REQUIRED",
          message: "缺少上传文件",
        });
      }
      const sourceName = String(file.name || "tender.pdf").trim();
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await analyzeTender({
        buffer,
        fileName: sourceName,
        mimeType: file.type,
      });
      const result = await runTenderRuntimeWorkflow({
        rawText: parsed.rawText,
        sourceName,
        options: { runCompliance: true, runSku: true },
      });
      if (!result.ok) return json(400, result);
      return json(200, { ...result, metadata: parsed.metadata });
    }

    const body = (await req.json().catch(() => null)) as TenderRuntimeWorkflowInput | null;
    if (!body) {
      return json(400, {
        ok: false,
        code: "BODY_REQUIRED",
        message: "请提供 JSON 请求体",
      });
    }

    const result = await runTenderRuntimeWorkflow(body);
    if (!result.ok) return json(400, result);
    return json(200, result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "tender runtime workflow failed";
    console.error("[tender/runtime/workflow]", err);
    return json(500, {
      ok: false,
      code: "WORKFLOW_ERROR",
      message,
    });
  }
}

export async function GET() {
  return json(200, {
    ok: true,
    message: "V2.9 Tender Runtime Workflow API",
    hint: {
      method: "POST",
      steps: [
        "parse",
        "semantic",
        "sku",
        "compliance",
        "evidence",
        "score",
        "gate",
        "decision",
      ],
      body: {
        rawText: "<招标文本>",
        options: { runCompliance: true, runSku: true },
      },
      response: {
        status: "ready | caution | blocked | incomplete",
        decision: "RuntimeDecision",
        recommendations: "RuntimeRecommendation[]",
        scoringImpact: "RuntimeScoringImpact",
        evidence: "EvidenceRuntimeResult",
        query: "EvidenceQueryResult",
      },
    },
  });
}
