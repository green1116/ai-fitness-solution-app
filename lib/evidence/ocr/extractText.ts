import type { AttachmentPayload, OcrDocumentResult, OcrExtraction } from "../types";
import { runDeterministicOcrOnPayload, runDeterministicOcrBatch } from "./runDeterministicOcr";
import { toOcrExtraction } from "./toOcrExtraction";

/**
 * @deprecated 请优先使用 runDeterministicOcr / runDeterministicOcrBatch
 * 保留 E1 兼容入口，内部委托 V3.4-E2 OCR Runtime
 */
export async function extractAttachmentText(
  payload: AttachmentPayload,
): Promise<OcrExtraction> {
  const doc = await runDeterministicOcrOnPayload(payload);
  return toOcrExtraction(doc);
}

export async function runOcrOnAttachments(
  payloads: AttachmentPayload[],
): Promise<OcrExtraction[]> {
  const docs = await runDeterministicOcrBatch(payloads);
  return docs.map(toOcrExtraction);
}

export async function runOcrDocumentsOnAttachments(
  payloads: AttachmentPayload[],
  parentRunId?: string,
): Promise<OcrDocumentResult[]> {
  return runDeterministicOcrBatch(payloads, parentRunId);
}
