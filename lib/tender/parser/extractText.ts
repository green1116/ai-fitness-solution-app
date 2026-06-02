import type { ParsedPage } from "@/lib/tender/types";

type PdfParseResult = {
  text?: string;
  numpages?: number;
};

async function loadPdfParse(): Promise<
  (buffer: Buffer) => Promise<PdfParseResult>
> {
  const mod = await import("pdf-parse");
  const fn = (mod as { default?: (b: Buffer) => Promise<PdfParseResult> }).default;
  if (!fn) throw new Error("pdf-parse module unavailable");
  return fn;
}

function splitTextIntoPages(fullText: string, numPages: number): string[] {
  const text = String(fullText || "");
  if (!text.trim()) return [];

  const byFormFeed = text.split(/\f+/).map((s) => s.trim()).filter(Boolean);
  if (byFormFeed.length >= 2) return byFormFeed;

  const byMarker: string[] = [];
  const markerRe = /(?:^|\n)\s*[-—]?\s*第\s*(\d+)\s*页\s*[-—]?(?=\n|$)/g;
  let lastIndex = 0;
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
    if (byMarker.filter(Boolean).length >= 2) return byMarker.filter(Boolean);
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
  const pdfParse = await loadPdfParse();
  const result = await pdfParse(buffer);
  const numPages = Math.max(1, result.numpages || 1);
  const chunks = splitTextIntoPages(String(result.text || ""), numPages);
  return chunks.map((text, i) => ({
    page: i + 1,
    text,
  }));
}

/** 从 DOCX 提取（整文作为单页，后续可接分页 OCR） */
export async function extractTextFromDocx(buffer: Buffer): Promise<ParsedPage[]> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  const text = String(result?.value || "").trim();
  return text ? [{ page: 1, text }] : [];
}

export async function extractTextFromPlainText(text: string): Promise<ParsedPage[]> {
  const t = String(text || "").trim();
  return t ? [{ page: 1, text: t }] : [];
}
