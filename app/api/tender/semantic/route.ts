import { NextRequest, NextResponse } from "next/server";

import { analyzeTender } from "@/lib/tender/analyzeTender";
import { buildSemanticGraph } from "@/lib/tender/semantic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

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
      const { graph, overview } = buildSemanticGraph(parsed);
      return json(200, {
        ok: true,
        sourceName,
        metadata: parsed.metadata,
        graph,
        overview,
      });
    }

    const body = await req.json().catch(() => null);
    const rawText = String((body as { rawText?: string })?.rawText || "").trim();
    const sourceName = String((body as { sourceName?: string })?.sourceName || "").trim();

    if (!rawText) {
      return json(400, {
        ok: false,
        code: "RAW_TEXT_REQUIRED",
        message: "请上传文件或提供 rawText",
      });
    }

    const parsed = await analyzeTender({
      rawText,
      fileName: sourceName || "pasted-tender.txt",
    });
    const { graph, overview } = buildSemanticGraph(parsed);

    return json(200, {
      ok: true,
      sourceName: sourceName || null,
      metadata: parsed.metadata,
      graph,
      overview,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "semantic failed";
    console.error("[tender/semantic]", err);
    return json(500, {
      ok: false,
      code: "TENDER_SEMANTIC_FAILED",
      message,
    });
  }
}
