import { NextRequest, NextResponse } from "next/server";

import {
  isInternalClientError,
  TENDER_INTAKE_RETRY,
  toTenderIntakeClientError,
} from "@/lib/client/clientFacingMessages";
import { parseTenderDocument } from "@/lib/tender/parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return json(400, {
        ok: false,
        code: "FILE_REQUIRED",
        message: "缺少上传文件",
      });
    }

    const sourceName = String(file.name || "tender-upload").trim();
    const lower = sourceName.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    if (lower.endsWith(".pdf")) {
      const parsed = await parseTenderDocument({
        buffer,
        fileName: sourceName,
        mimeType: file.type || "application/pdf",
      });

      return json(200, {
        ok: true,
        sourceName,
        rawText: parsed.rawText,
        pages: parsed.pages,
        metadata: parsed.metadata,
        meta: {
          pageCount: parsed.pages.length,
          chars: parsed.rawText.length,
          sectionCount: parsed.sections.length,
        },
      });
    }

    if (lower.endsWith(".docx")) {
      const parsed = await parseTenderDocument({
        buffer,
        fileName: sourceName,
      });
      return json(200, {
        ok: true,
        sourceName,
        rawText: parsed.rawText,
        pages: parsed.pages,
        metadata: parsed.metadata,
        meta: { pageCount: parsed.pages.length, chars: parsed.rawText.length },
      });
    }

    if (
      lower.endsWith(".txt") ||
      lower.endsWith(".md") ||
      lower.endsWith(".csv")
    ) {
      const rawText = buffer.toString("utf8");
      const parsed = await parseTenderDocument({ rawText, fileName: sourceName });
      return json(200, {
        ok: true,
        sourceName,
        rawText: parsed.rawText,
        pages: parsed.pages,
        metadata: parsed.metadata,
        meta: { chars: parsed.rawText.length },
      });
    }

    return json(400, {
      ok: false,
      code: "UNSUPPORTED_FILE_TYPE",
      message: "暂支持 PDF / DOCX / TXT",
    });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : "intake failed";
    console.error("[tender/intake]", err);
    const message =
      process.env.NODE_ENV === "production" || isInternalClientError(raw)
        ? toTenderIntakeClientError(raw)
        : raw.includes("pdf-parse") || raw.includes("module unavailable")
          ? "PDF 解析模块不可用，请尝试上传 TXT/DOCX，或直接粘贴文本。"
          : raw;
    return json(500, {
      ok: false,
      code: "TENDER_INTAKE_FAILED",
      message: message || TENDER_INTAKE_RETRY,
    });
  }
}
