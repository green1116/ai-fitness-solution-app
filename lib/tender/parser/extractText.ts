import type { ParsedPage } from "@/lib/tender/types";

import { loadPdfParse } from "./loadPdfParse";

function splitTextIntoPages(fullText: string, numPages: number): string[] {
  const text = String(fullText || "");
  if (!text.trim()) return [];

  const byFormFeed = text
    .split(/\f+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byFormFeed.length >= 2) return byFormFeed;

  const byMarker: string[] = [];
  const markerRe = /(?:^|\n)\s*[-—]?\s*第\s*(\d+)\s*页\s*[-—]?(?=\n|$)/g;
  let m: RegExpExecArray | null;
  const markers: { index: number; page: number }[] = [];

  while ((m = markerRe.exec(text)) !== null) {
    markers.push({ index: m.index, page: parseInt(m[1], 10) });
  }

  if (markers.length >= 2) {
    for (let i = 0; i < markers.length; i++) {
      const start = markers[i].index;
      const end = i + 1 < markers.length ? markers[i + 1].index : text.length;
      byMarker.push(text.slice(start, end).trim());
    }
    const filtered = byMarker.filter(Boolean);
    if (filtered.length >= 2) return filtered;
  }

  const pages = Math.max(1, numPages || 1);
  if (pages === 1) return [text.trim()];

  const chunkSize = Math.ceil(text.length / pages);
  const chunks: string[] = [];
  for (let i = 0; i < pages; i++) {
    const slice = text.slice(i * chunkSize, (i + 1) * chunkSize).trim();
    if (slice) chunks.push(slice);
  }
  return chunks.length ? chunks : [text.trim()];
}

/** 从 PDF 二进制提取 page-level 文本 */
export async function extractTextFromPdf(buffer: Buffer): Promise<ParsedPage[]> {
  if (!buffer?.length) return [];

  try {
    const pdfParse = await loadPdfParse();
    const result = await pdfParse(buffer);

    const numPages = Math.max(1, result.numpages || 1);
    const rawText = String(result.text || "");

    console.log("[tender/parser] pdf parsed", {
      bytes: buffer.length,
      numPages,
      textChars: rawText.length,
    });

    const chunks = splitTextIntoPages(rawText, numPages);

    if (!chunks.length) {
      console.warn("[tender/parser] pdf parse returned empty text");
      return [];
    }

    return chunks.map((text, i) => ({
      page: i + 1,
      text,
    }));
  } catch (err) {
    console.error("[tender/parser] pdf parse failed", err);
    throw new Error("PDF_PARSE_FAILED");
  }
}

/** 从 DOCX 提取（整文作为单页，后续可接分页 OCR） */
export async function extractTextFromDocx(buffer: Buffer): Promise<ParsedPage[]> {
  if (!buffer?.length) return [];

  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const text = String(result?.value || "").trim();

    console.log("[tender/parser] docx parsed", {
      bytes: buffer.length,
      textChars: text.length,
    });

    return text ? [{ page: 1, text }] : [];
  } catch (err) {
    console.error("[tender/parser] docx parse failed", err);
    throw new Error("DOCX_PARSE_FAILED");
  }
}

export async function extractTextFromPlainText(
  text: string
): Promise<ParsedPage[]> {
  const t = String(text || "").trim();
  return t ? [{ page: 1, text: t }] : [];
}