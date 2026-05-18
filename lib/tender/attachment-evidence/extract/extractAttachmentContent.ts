import { parseTenderDocument } from "@/lib/tender/parser";
import type {
  AttachmentExtractionMethod,
  AttachmentInput,
  ExtractedAttachment,
} from "../types";

function attachmentIdFrom(fileName: string) {
  const base = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 64);
  return `att-${base}-${Date.now().toString(36).slice(-6)}`;
}

function extOf(fileName: string): string {
  const i = fileName.toLowerCase().lastIndexOf(".");
  return i >= 0 ? fileName.slice(i) : "";
}

function resolveMethod(
  fileName: string,
  mimeType: string | undefined,
  pageCount: number,
  charCount: number,
): AttachmentExtractionMethod {
  const ext = extOf(fileName);
  if (/\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(ext)) {
    return charCount > 0 ? "plain_text" : "filename_only";
  }
  if (ext === ".pdf" || mimeType === "application/pdf") return "pdf_text";
  if (ext === ".docx" || mimeType?.includes("wordprocessingml")) return "docx_text";
  if (charCount > 0) return "plain_text";
  return "unsupported";
}

/**
 * V3.3 从外部附件提取文本（pdf-parse / mammoth / plain，非 LLM）
 */
export async function extractAttachmentContent(
  input: AttachmentInput,
): Promise<ExtractedAttachment> {
  const fileName = String(input.fileName || "attachment.bin").trim();
  const attachmentId = input.attachmentCode || attachmentIdFrom(fileName);

  let rawText = "";
  let pageCount = 0;

  try {
    const parsed = await parseTenderDocument({
      buffer: input.buffer,
      fileName,
      mimeType: input.mimeType,
    });
    rawText = parsed.rawText || "";
    pageCount = parsed.pages?.length || (rawText ? 1 : 0);
  } catch {
    rawText = "";
    pageCount = 0;
  }

  const charCount = rawText.length;
  const extractionMethod = resolveMethod(fileName, input.mimeType, pageCount, charCount);
  const excerpt = rawText.slice(0, 400).replace(/\s+/g, " ").trim();

  return {
    attachmentId,
    fileName,
    mimeType: input.mimeType,
    extractionMethod,
    pageCount,
    charCount,
    rawText,
    excerpt,
    evidenceType: "datasheet",
    classificationLabel: "pending",
    classificationConfidence: 0.5,
    semanticTags: [],
    linkedRequirementIds: [],
  };
}
