import { NextRequest, NextResponse } from "next/server";

import { analyzeTender } from "@/lib/tender/analyzeTender";
import { runEvidenceApi } from "@/lib/tender/evidence/query";
import type { EvidenceApiRequest } from "@/lib/tender/evidence/query/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V2.7 Evidence API — 统一 build + query
 *
 * POST { action?: "build"|"query"|"runtime", rawText?, graph?, filters?, registry?, ... }
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
      const result = await runEvidenceApi({
        action: "build",
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

    const result = await runEvidenceApi(body);
    if (!result.ok) return json(400, result);
    return json(200, result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "evidence api failed";
    console.error("[tender/evidence]", err);
    return json(500, {
      ok: false,
      code: "EVIDENCE_API_ERROR",
      message,
    });
  }
}

/**
 * GET — 通过 query string 做轻量只读查询（需客户端传入 registry 快照时请用 POST）
 *
 * ?requirementId=REQ-001 仅返回说明；完整查询请 POST registry
 */
export async function GET(req: NextRequest) {
  const requirementId = req.nextUrl.searchParams.get("requirementId");
  return json(200, {
    ok: true,
    message: "V2.7 Evidence Query API — 请使用 POST /api/tender/evidence",
    hint: {
      build: {
        method: "POST",
        body: {
          action: "build",
          rawText: "<招标文本>",
          options: { runCompliance: true, runSku: true },
        },
      },
      query: {
        method: "POST",
        body: {
          action: "query",
          registry: "<EvidenceRegistry>",
          matrix: "<TenderEvidenceMatrixRow[]>",
          coverage: "<RequirementCoverageResult[]>",
          filters: { requirementId: requirementId || "<id>" },
        },
      },
      runtime: {
        method: "POST",
        path: "/api/tender/evidence/runtime",
        body: {
          action: "runtime",
          rawText: "<招标文本>",
          options: { runCompliance: true, runSku: true },
        },
      },
      trace: {
        method: "POST",
        path: "/api/tender/evidence/trace",
        body: { registry: "<EvidenceRegistry>", coverage: "[]" },
      },
    },
  });
}
