/**
 * V3.4-E2 Deterministic OCR Runtime — 类型契约
 */

import type { OcrMethod } from "./evidence";

export const OCR_RUNTIME_VERSION = "3.4-e2" as const;

export type OcrRuntimeVersion = typeof OCR_RUNTIME_VERSION;

export type OcrCoordinateUnit = "normalized" | "point";

/** 确定性版面坐标（非 AI 推断） */
export type OcrCoordinate = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  unit: OcrCoordinateUnit;
};

export type OcrBlockKind =
  | "heading"
  | "paragraph"
  | "table_row"
  | "list_item"
  | "line"
  | "page_break"
  | "filename_fallback";

/** OCR 文本块（page-aware + block-aware） */
export type OcrBlock = {
  blockId: string;
  attachmentId: string;
  page: number;
  kind: OcrBlockKind;
  text: string;
  /** 文档级字符偏移 [charStart, charEnd) */
  charStart: number;
  charEnd: number;
  /** 页内行号（1-based） */
  lineStart: number;
  lineEnd: number;
  coordinates: OcrCoordinate;
};

export type OcrPageLayout = {
  page: number;
  attachmentId: string;
  width: number;
  height: number;
  unit: OcrCoordinateUnit;
  charCount: number;
  lineCount: number;
  blockCount: number;
  blocks: OcrBlock[];
  excerpt: string;
};

export type OcrEngineId =
  | "pdf-parse"
  | "mammoth"
  | "plain-utf8"
  | "filename-only"
  | "unsupported";

export type OcrMetadata = {
  version: OcrRuntimeVersion;
  runId: string;
  attachmentId: string;
  fileName: string;
  mimeType: string;
  method: OcrMethod;
  engine: OcrEngineId;
  extractedAt: string;
  durationMs: number;
  pageCount: number;
  blockCount: number;
  charCount: number;
  lineCount: number;
  warnings: string[];
  sha256?: string;
};

export type OcrAuditEventKind =
  | "extract_raw"
  | "segment_blocks"
  | "assign_coordinates"
  | "build_metadata"
  | "warning";

export type OcrAuditEvent = {
  eventId: string;
  runId: string;
  attachmentId: string;
  kind: OcrAuditEventKind;
  message: string;
  at: string;
  payload?: Record<string, unknown>;
};

export type OcrRuntimeTrace = {
  version: OcrRuntimeVersion;
  runId: string;
  attachmentId: string;
  events: OcrAuditEvent[];
};

/** 单附件 OCR 完整结果 */
export type OcrDocumentResult = {
  attachmentId: string;
  metadata: OcrMetadata;
  pages: OcrPageLayout[];
  blocks: OcrBlock[];
  rawText: string;
  excerpt: string;
  trace: OcrRuntimeTrace;
};

export type DeterministicOcrRuntimeInput = {
  attachmentId: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  sha256?: string;
  runId?: string;
};

export type DeterministicOcrRuntimeContract = {
  version: OcrRuntimeVersion;
  pipeline: readonly ["extract_raw", "segment_blocks", "assign_coordinates", "build_metadata"];
};

export const DETERMINISTIC_OCR_RUNTIME_CONTRACT: DeterministicOcrRuntimeContract = {
  version: OCR_RUNTIME_VERSION,
  pipeline: ["extract_raw", "segment_blocks", "assign_coordinates", "build_metadata"],
};
