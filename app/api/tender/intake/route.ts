import { NextRequest, NextResponse } from "next/server";

import { TENDER_INTAKE_RETRY } from "@/lib/client/clientFacingMessages";
import { parseTenderDocument } from "@/lib/tender/parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (parseErr: unknown) {
      console.error(
        "[tender/intake] formData parse failed",
        parseErr instanceof Error
          ? { name: parseErr.name, message: parseErr.message, stack: parseErr.stack }
          : parseErr,
      );
      return json(400, {
        ok: false,
        code: "TENDER_INTAKE_FAILED",
        message: TENDER_INTAKE_RETRY,
      });
    }

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

    console.log("[tender/intake] upload received", {
      sourceName,
      mimeType: file.type || "",
      size: buffer.length,
    });

    if (lower.endsWith(".pdf")) {
      const parsed = await parseTenderDocument({
        buffer,
        fileName: sourceName,
        mimeType: file.type || "application/pdf",
      });

      console.log("[tender/intake] pdf parsed", {
        sourceName,
        pages: parsed.pages?.length ?? 0,
        chars: parsed.rawText?.length ?? 0,
        sections: parsed.sections?.length ?? 0,
      });

      if (!String(parsed.rawText || "").trim()) {
        return json(422, {
          ok: false,
          code: "TENDER_PDF_EMPTY_TEXT",
          message: "招标文件未提取到可识别文本，请尝试上传可复制文本的 PDF，或改用 TXT / DOCX / 手动粘贴正文。",
        });
      }

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

      console.log("[tender/intake] docx parsed", {
        sourceName,
        pages: parsed.pages?.length ?? 0,
        chars: parsed.rawText?.length ?? 0,
      });

      if (!String(parsed.rawText || "").trim()) {
        return json(422, {
          ok: false,
          code: "TENDER_DOCX_EMPTY_TEXT",
          message: "DOCX 未提取到文本，请检查文件内容后重试。",
        });
      }

      return json(200, {
        ok: true,
        sourceName,
        rawText: parsed.rawText,
        pages: parsed.pages,
        metadata: parsed.metadata,
        meta: {
          pageCount: parsed.pages.length,
          chars: parsed.rawText.length,
        },
      });
    }

    if (
      lower.endsWith(".txt") ||
      lower.endsWith(".md") ||
      lower.endsWith(".csv")
    ) {
      const rawText = buffer.toString("utf8");
      const parsed = await parseTenderDocument({ rawText, fileName: sourceName });

      console.log("[tender/intake] text parsed", {
        sourceName,
        chars: parsed.rawText?.length ?? 0,
        pages: parsed.pages?.length ?? 0,
      });

      if (!String(parsed.rawText || "").trim()) {
        return json(422, {
          ok: false,
          code: "TENDER_TEXT_EMPTY",
          message: "文件内容为空，请检查后重新上传。",
        });
      }

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
    console.error(
      "[tender/intake]",
      err instanceof Error
        ? {
            name: err.name,
            message: err.message,
            stack: err.stack,
          }
        : err
    );

    return json(500, {
      ok: false,
      code: "TENDER_INTAKE_FAILED",
      message: TENDER_INTAKE_RETRY,
    });
  }
}