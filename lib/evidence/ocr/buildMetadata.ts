import type { OcrEngineId, OcrMetadata, OcrMethod } from "../types";
import { OCR_RUNTIME_VERSION } from "../types";

export function buildOcrMetadata(input: {
  runId: string;
  attachmentId: string;
  fileName: string;
  mimeType: string;
  method: OcrMethod;
  engine: OcrEngineId;
  durationMs: number;
  pageCount: number;
  blockCount: number;
  charCount: number;
  lineCount: number;
  warnings: string[];
  sha256?: string;
}): OcrMetadata {
  return {
    version: OCR_RUNTIME_VERSION,
    runId: input.runId,
    attachmentId: input.attachmentId,
    fileName: input.fileName,
    mimeType: input.mimeType,
    method: input.method,
    engine: input.engine,
    extractedAt: new Date().toISOString(),
    durationMs: input.durationMs,
    pageCount: input.pageCount,
    blockCount: input.blockCount,
    charCount: input.charCount,
    lineCount: input.lineCount,
    warnings: input.warnings,
    sha256: input.sha256,
  };
}
