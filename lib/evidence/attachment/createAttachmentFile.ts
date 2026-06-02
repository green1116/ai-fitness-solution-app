import { createHash } from "crypto";

import type { AttachmentFile, AttachmentPayload, AttachmentSourceType } from "../types";

function newAttachmentId(fileName: string) {
  const base = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 48);
  return `att-${base}-${Date.now().toString(36).slice(-6)}`;
}

export type CreateAttachmentFileInput = {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  sourceType?: AttachmentSourceType;
  id?: string;
  uploadedAt?: string;
  pages?: number;
};

/**
 * 规范化上传附件 → AttachmentFile（确定性元数据）
 */
export function createAttachmentFile(input: CreateAttachmentFileInput): AttachmentFile {
  const fileName = String(input.fileName || "attachment.bin").trim();
  const mimeType = input.mimeType?.trim() || "application/octet-stream";
  const size = input.buffer.length;
  const sha256 = createHash("sha256").update(input.buffer).digest("hex");

  return {
    id: input.id || newAttachmentId(fileName),
    fileName,
    mimeType,
    sourceType: input.sourceType || "upload",
    size,
    uploadedAt: input.uploadedAt || new Date().toISOString(),
    pages: input.pages,
    sha256,
  };
}

export function toAttachmentPayload(
  input: CreateAttachmentFileInput,
): AttachmentPayload {
  return {
    file: createAttachmentFile(input),
    buffer: input.buffer,
  };
}
