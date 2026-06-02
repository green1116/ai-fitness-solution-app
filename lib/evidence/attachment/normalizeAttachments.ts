import type { AttachmentFile, AttachmentPayload } from "../types";
import { createAttachmentFile, type CreateAttachmentFileInput } from "./createAttachmentFile";

export type NormalizeAttachmentsResult = {
  files: AttachmentFile[];
  payloads: AttachmentPayload[];
};

/**
 * Attachment Runtime — 批量规范化输入
 */
export function normalizeAttachments(
  inputs: CreateAttachmentFileInput[],
): NormalizeAttachmentsResult {
  const payloads = inputs.map((input) => ({
    file: createAttachmentFile(input),
    buffer: input.buffer,
  }));

  return {
    files: payloads.map((p) => p.file),
    payloads,
  };
}
