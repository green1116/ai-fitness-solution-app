import type { AttachmentInput } from "@/lib/tender/attachment-evidence/types";
import type { AttachmentRuntimeResult } from "../types";

/**
 * V3.4 Attachment Runtime — 规范化外部附件输入
 */
export function runAttachmentRuntime(
  attachments: AttachmentInput[],
): AttachmentRuntimeResult {
  const normalized = attachments
    .filter((a) => a.buffer?.length > 0)
    .map((a) => ({
      buffer: a.buffer,
      fileName: String(a.fileName || "attachment.bin").trim(),
      mimeType: a.mimeType,
      attachmentCode: a.attachmentCode,
    }));

  return {
    normalized,
    count: normalized.length,
  };
}
