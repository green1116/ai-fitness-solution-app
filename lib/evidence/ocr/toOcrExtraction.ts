import type { OcrDocumentResult, OcrExtraction, OcrPage } from "../types";

/**
 * 将 V3.4-E2 OCR Document 映射为 E1 兼容的 OcrExtraction
 */
export function toOcrExtraction(doc: OcrDocumentResult): OcrExtraction {
  const pages: OcrPage[] = doc.pages.map((p) => ({
    attachmentId: doc.attachmentId,
    page: p.page,
    charCount: p.charCount,
    excerpt: p.excerpt,
  }));

  return {
    attachmentId: doc.attachmentId,
    fileName: doc.metadata.fileName,
    mimeType: doc.metadata.mimeType,
    method: doc.metadata.method,
    pageCount: doc.metadata.pageCount,
    charCount: doc.metadata.charCount,
    rawText: doc.rawText,
    excerpt: doc.excerpt,
    pages,
  };
}
