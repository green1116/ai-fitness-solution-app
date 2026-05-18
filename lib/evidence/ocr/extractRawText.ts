import type { OcrEngineId, OcrMethod } from "../types";

export type RawTextExtraction = {
  rawText: string;
  pageTexts: string[];
  pageCount: number;
  method: OcrMethod;
  engine: OcrEngineId;
  warnings: string[];
};

function extOf(fileName: string): string {
  const i = fileName.toLowerCase().lastIndexOf(".");
  return i >= 0 ? fileName.slice(i) : "";
}

function resolveMethod(
  fileName: string,
  mimeType: string,
  charCount: number,
): OcrMethod {
  const ext = extOf(fileName);
  if (/\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(ext)) {
    return charCount > 0 ? "plain_text" : "filename_only";
  }
  if (ext === ".pdf" || mimeType === "application/pdf") return "pdf_text";
  if (ext === ".docx" || mimeType.includes("wordprocessingml")) return "docx_text";
  if (charCount > 0) return "plain_text";
  return "unsupported";
}

async function extractPdf(buffer: Buffer): Promise<{ texts: string[]; engine: OcrEngineId }> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    const full = String(parsed.text || "");
    const n = Math.max(1, parsed.numpages || (full ? 1 : 0));
    if (n <= 1) return { texts: full ? [full] : [], engine: "pdf-parse" };

    const formFeed = full.split("\f");
    if (formFeed.length >= n) {
      return { texts: formFeed.slice(0, n), engine: "pdf-parse" };
    }

    const chunk = Math.ceil(full.length / n) || full.length;
    const pages: string[] = [];
    for (let i = 0; i < n; i++) {
      pages.push(full.slice(i * chunk, (i + 1) * chunk));
    }
    return { texts: pages, engine: "pdf-parse" };
  } catch {
    return { texts: [], engine: "pdf-parse" };
  }
}

async function extractDocx(buffer: Buffer): Promise<{ texts: string[]; engine: OcrEngineId }> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const text = String(result.value || "");
    return { texts: text ? [text] : [], engine: "mammoth" };
  } catch {
    return { texts: [], engine: "mammoth" };
  }
}

/**
 * 原始文本提取（引擎层，无 AI）
 */
export async function extractRawText(input: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<RawTextExtraction> {
  const fileName = input.fileName.trim();
  const mimeType = input.mimeType || "application/octet-stream";
  const ext = extOf(fileName);
  const warnings: string[] = [];
  let pageTexts: string[] = [];
  let engine: OcrEngineId = "unsupported";

  if (ext === ".pdf" || mimeType === "application/pdf") {
    const pdf = await extractPdf(input.buffer);
    pageTexts = pdf.texts;
    engine = pdf.engine;
  } else if (ext === ".docx" || mimeType.includes("wordprocessingml")) {
    const docx = await extractDocx(input.buffer);
    pageTexts = docx.texts;
    engine = docx.engine;
  } else if (
    mimeType.startsWith("text/") ||
    /\.(txt|md|csv|json|xml|html?)$/i.test(ext)
  ) {
    const text = input.buffer.toString("utf8");
    pageTexts = text ? [text] : [];
    engine = "plain-utf8";
  } else if (input.buffer.length > 0 && input.buffer.length < 512_000) {
    const probe = input.buffer.toString("utf8");
    if (!probe.includes("\u0000")) {
      pageTexts = probe ? [probe] : [];
      engine = "plain-utf8";
    }
  }

  const rawText = pageTexts.join("\n\n");
  const charCount = rawText.length;

  if (charCount === 0 && !/\.(pdf|docx)$/i.test(ext)) {
    pageTexts = [fileName];
    engine = "filename-only";
    warnings.push("无文本内容，回退为文件名块");
  }

  const method = resolveMethod(fileName, mimeType, charCount);
  const pageCount = Math.max(1, pageTexts.length || (rawText ? 1 : 0));
  if (pageTexts.length === 0 && rawText) {
    pageTexts = [rawText];
  } else if (pageTexts.length === 0) {
    pageTexts = [""];
  }

  return {
    rawText: pageTexts.join("\n\n"),
    pageTexts,
    pageCount,
    method: engine === "filename-only" ? "filename_only" : method,
    engine,
    warnings,
  };
}
