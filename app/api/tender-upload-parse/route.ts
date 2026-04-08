import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function normalizeText(input: string) {
  return String(input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractTextFromTxt(file: File) {
  const text = await file.text();
  return normalizeText(text);
}

async function extractTextFromDocx(buffer: Buffer) {
  const mammoth = require("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return normalizeText(result?.value || "");
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

    const sourceName =
      String(file.name || "uploaded-file").trim() || "uploaded-file";
    const lowerName = sourceName.toLowerCase();

    let rawText = "";

    if (
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".md") ||
      lowerName.endsWith(".csv")
    ) {
      rawText = await extractTextFromTxt(file);
    } else if (lowerName.endsWith(".docx")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      rawText = await extractTextFromDocx(buffer);
    } else if (lowerName.endsWith(".pdf")) {
      return json(400, {
        ok: false,
        code: "PDF_PARSE_TEMP_DISABLED",
        message:
          "当前版本暂未启用 PDF 直传解析，请先将招标文件另存为 txt 或 docx 后上传。",
      });
    } else {
      return json(400, {
        ok: false,
        code: "UNSUPPORTED_FILE_TYPE",
        message: "暂不支持该文件类型，请上传 txt / docx",
      });
    }

    if (!rawText) {
      return json(400, {
        ok: false,
        code: "TEXT_EMPTY",
        message: "文件内容为空或无法提取文本",
      });
    }

    console.log("[tender-upload-parse]", {
      sourceName,
      chars: rawText.length,
      preview: rawText.slice(0, 120),
    });

    return json(200, {
      ok: true,
      sourceName,
      rawText,
      meta: {
        chars: rawText.length,
      },
    });
  } catch (err: any) {
    console.error("[tender-upload-parse] failed", err);
    return json(500, {
      ok: false,
      code: "TENDER_UPLOAD_PARSE_FAILED",
      message: err?.message || "文件解析失败",
    });
  }
}