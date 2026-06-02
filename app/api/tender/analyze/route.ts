import { NextRequest, NextResponse } from "next/server";

import { analyzeTender, countRequirements } from "@/lib/tender/analyzeTender";

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
      const result = await analyzeTender({
        buffer,
        fileName: sourceName,
        mimeType: file.type,
      });
      const counts = countRequirements(result.requirements);
      return json(200, {
        ok: true,
        sourceName,
        metadata: result.metadata,
        sections: result.sections,
        tables: result.tables,
        pages: result.pages,
        requirements: result.requirements,
        counts,
        rawTextLength: result.rawText.length,
      });
    }

    const body = await req.json().catch(() => null);
    const rawText = String((body as { rawText?: string })?.rawText || "").trim();
    const sourceName = String((body as { sourceName?: string })?.sourceName || "").trim();

    if (!rawText) {
      return json(400, {
        ok: false,
        code: "RAW_TEXT_REQUIRED",
        message: "请上传 PDF 或提供 rawText",
      });
    }

    const result = await analyzeTender({
      rawText,
      fileName: sourceName || "pasted-tender.txt",
    });
    const counts = countRequirements(result.requirements);

    return json(200, {
      ok: true,
      sourceName: sourceName || null,
      metadata: result.metadata,
      sections: result.sections,
      tables: result.tables,
      pages: result.pages,
      requirements: result.requirements,
      counts,
      rawTextLength: result.rawText.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "analyze failed";
    console.error("[tender/analyze]", err);
    return json(500, {
      ok: false,
      code: "TENDER_ANALYZE_FAILED",
      message,
    });
  }
}
