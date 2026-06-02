import type { OcrDocumentResult, OcrRuntimeTrace } from "../types";

export function formatOcrTrace(trace: OcrRuntimeTrace): string {
  const lines = [
    `[${trace.version}] ocr-run=${trace.runId} attachment=${trace.attachmentId}`,
    `events=${trace.events.length}`,
    "---",
  ];
  for (const e of trace.events) {
    lines.push(`${e.at} [${e.kind}] ${e.message}`);
  }
  return lines.join("\n");
}

export function summarizeOcrDocument(doc: OcrDocumentResult): string {
  return [
    `OCR ${doc.metadata.version} ${doc.metadata.fileName}`,
    `engine=${doc.metadata.engine} method=${doc.metadata.method}`,
    `pages=${doc.metadata.pageCount} blocks=${doc.metadata.blockCount} chars=${doc.metadata.charCount}`,
    `durationMs=${doc.metadata.durationMs}`,
  ].join(" | ");
}
