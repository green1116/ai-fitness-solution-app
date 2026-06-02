import { NextRequest, NextResponse } from "next/server";

import { analyzeTender } from "@/lib/tender/analyzeTender";
import { runEvidenceRuntimeApi } from "@/lib/tender/evidence/query";
import type { EvidenceApiRequest } from "@/lib/tender/evidence/query/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V2.8 Evidence Runtime API — 分阶段运行 evidence，返回 trace + decision + query
 *
 * POST { rawText?, graph?, registry?, runtimePolicy?, forceAllow?, filters? }
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
      const result = await runEvidenceRuntimeApi({
        action: "runtime",
        rawText: parsed.rawText,
        sourceName,
        options: { runCompliance: true, runSku: true },
      });
      if (!result.ok) return json(400, result);
      return json(200, { ...result, metadata: parsed.metadata });
    }

    const body = (await req.json().catch(() => null)) as EvidenceApiRequest | null;
    if (!body) {
      return json(400, {
        ok: false,
        code: "BODY_REQUIRED",
        message: "请提供 JSON 请求体",
      });
    }

    const result = await runEvidenceRuntimeApi({ ...body, action: "runtime" });
    if (!result.ok) return json(400, result);
    return json(200, result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "evidence runtime failed";
    console.error("[tender/evidence/runtime]", err);
    return json(500, {
      ok: false,
      code: "EVIDENCE_RUNTIME_ERROR",
      message,
    });
  }
}

export async function GET() {
  return json(200, {
    ok: true,
    message: "V2.8 Evidence Runtime API",
    hint: {
      method: "POST",
      body: {
        action: "runtime",
        rawText: "<招标文本>",
        options: { runCompliance: true, runSku: true },
        runtimePolicy: {
          blockOnUnsupportedCount: 5,
          blockOnMandatoryUnsupportedCount: 1,
        },
      },
      response: {
        evidence: "EvidenceAdapterResult",
        query: "EvidenceQueryResult",
        runtime: {
          trace: "EvidenceTraceLog",
          decision: "EvidenceDecisionResult (allow|warn|block)",
          stages: "EvidenceStageResult[]",
        },
      },
    },
  });
}
