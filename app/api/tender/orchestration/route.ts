import { NextRequest, NextResponse } from "next/server";

import { analyzeTender } from "@/lib/tender/analyzeTender";
import { runTenderOrchestration } from "@/lib/tender/orchestration";
import type { TenderOrchestrationInput } from "@/lib/tender/orchestration/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V3.0 Tender Runtime Orchestration API
 *
 * POST { rawText?, graph?, planId?, orchestrationPolicy?, ...workflowOptions }
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
      const planId = String(formData.get("planId") || "").trim() || undefined;
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await analyzeTender({
        buffer,
        fileName: sourceName,
        mimeType: file.type,
      });
      const result = await runTenderOrchestration({
        rawText: parsed.rawText,
        sourceName,
        planId,
        options: { runCompliance: true, runSku: true },
      });
      if (!result.ok) return json(400, result);
      return json(200, { ...result, metadata: parsed.metadata });
    }

    const body = (await req.json().catch(() => null)) as TenderOrchestrationInput | null;
    if (!body) {
      return json(400, {
        ok: false,
        code: "BODY_REQUIRED",
        message: "请提供 JSON 请求体",
      });
    }

    const result = await runTenderOrchestration(body);
    if (!result.ok) return json(400, result);
    return json(200, result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "orchestration failed";
    console.error("[tender/orchestration]", err);
    return json(500, {
      ok: false,
      code: "ORCHESTRATION_ERROR",
      message,
    });
  }
}

export async function GET() {
  return json(200, {
    ok: true,
    version: "3.0",
    message: "Tender Runtime Orchestration Core",
    hint: {
      method: "POST",
      phases: [
        "initialize",
        "workflow",
        "route",
        "readiness",
        "escalate",
        "finalize",
      ],
      body: {
        rawText: "<招标文本>",
        planId: "<optional>",
        options: { runCompliance: true, runSku: true },
        orchestrationPolicy: {
          minReadinessScore: 75,
          allowConditionalSubmit: true,
        },
      },
      response: {
        outcome: {
          verdict: "submit | conditional_submit | defer | abort",
        },
        route: "DecisionRoute",
        escalation: "EscalationResult",
        readiness: "SubmissionReadiness",
        workflow: "TenderRuntimeWorkflowResult (V2.9)",
      },
    },
  });
}
