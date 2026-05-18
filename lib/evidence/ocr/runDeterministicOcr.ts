import type { AttachmentPayload, DeterministicOcrRuntimeInput, OcrDocumentResult } from "../types";
import { assignBlockCoordinates, buildPageLayouts } from "./assignCoordinates";
import { buildOcrMetadata } from "./buildMetadata";
import { extractRawText } from "./extractRawText";
import { appendOcrEvent, createOcrTrace } from "./ocrTrace";
import { segmentDocumentIntoBlocks } from "./segmentBlocks";

function newOcrRunId() {
  return `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * V3.4-E2 Deterministic OCR Runtime
 *
 * Attachment → OCR Blocks → Coordinates → Metadata → Evidence-ready document
 */
export async function runDeterministicOcr(
  input: DeterministicOcrRuntimeInput,
): Promise<OcrDocumentResult> {
  const started = Date.now();
  const runId = input.runId || newOcrRunId();
  let trace = createOcrTrace(runId, input.attachmentId);

  trace = appendOcrEvent(trace, "extract_raw", "开始原始文本提取");

  const raw = await extractRawText({
    buffer: input.buffer,
    fileName: input.fileName,
    mimeType: input.mimeType,
  });

  trace = appendOcrEvent(trace, "extract_raw", "原始文本提取完成", {
    engine: raw.engine,
    charCount: raw.rawText.length,
    pages: raw.pageCount,
  });

  const filenameFallback =
    raw.engine === "filename-only" ? input.fileName : undefined;

  trace = appendOcrEvent(trace, "segment_blocks", "开始块切分");

  let blocks = segmentDocumentIntoBlocks(
    input.attachmentId,
    raw.pageTexts,
    filenameFallback,
  );

  trace = appendOcrEvent(trace, "segment_blocks", `切分 ${blocks.length} 个块`, {
    blockCount: blocks.length,
  });

  trace = appendOcrEvent(trace, "assign_coordinates", "分配版面坐标");

  blocks = assignBlockCoordinates(blocks);
  const pages = buildPageLayouts(input.attachmentId, blocks);

  trace = appendOcrEvent(trace, "assign_coordinates", "坐标分配完成", {
    pages: pages.length,
  });

  const lineCount = pages.reduce((n, p) => n + p.lineCount, 0);
  const warnings = [...raw.warnings];
  const excerpt = raw.rawText.slice(0, 400).replace(/\s+/g, " ").trim();

  trace = appendOcrEvent(trace, "build_metadata", "构建 OCR 元数据");

  const metadata = buildOcrMetadata({
    runId,
    attachmentId: input.attachmentId,
    fileName: input.fileName,
    mimeType: input.mimeType,
    method: raw.method,
    engine: raw.engine,
    durationMs: Date.now() - started,
    pageCount: pages.length,
    blockCount: blocks.length,
    charCount: raw.rawText.length,
    lineCount,
    warnings,
    sha256: input.sha256,
  });

  if (warnings.length) {
    for (const w of warnings) {
      trace = appendOcrEvent(trace, "warning", w);
    }
  }

  return {
    attachmentId: input.attachmentId,
    metadata,
    pages,
    blocks,
    rawText: raw.rawText,
    excerpt,
    trace,
  };
}

export async function runDeterministicOcrOnPayload(
  payload: AttachmentPayload,
  runId?: string,
): Promise<OcrDocumentResult> {
  return runDeterministicOcr({
    attachmentId: payload.file.id,
    fileName: payload.file.fileName,
    mimeType: payload.file.mimeType,
    buffer: payload.buffer,
    sha256: payload.file.sha256,
    runId,
  });
}

export async function runDeterministicOcrBatch(
  payloads: AttachmentPayload[],
  parentRunId?: string,
): Promise<OcrDocumentResult[]> {
  const results: OcrDocumentResult[] = [];
  for (const payload of payloads) {
    results.push(await runDeterministicOcrOnPayload(payload, parentRunId));
  }
  return results;
}
