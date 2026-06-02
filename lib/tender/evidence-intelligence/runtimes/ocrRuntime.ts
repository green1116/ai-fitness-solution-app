import { extractAttachmentContent } from "@/lib/tender/attachment-evidence/extract/extractAttachmentContent";
import type { AttachmentInput, ExtractedAttachment } from "@/lib/tender/attachment-evidence/types";
import type { OcrRuntimeResult } from "../types";

/**
 * V3.4 OCR Runtime — 确定性文本提取（pdf-parse / mammoth / plain，非 LLM）
 */
export async function runOcrRuntime(
  attachments: AttachmentInput[],
): Promise<OcrRuntimeResult> {
  const extractions: ExtractedAttachment[] = [];
  const pages: OcrRuntimeResult["pages"] = [];
  const methods: Record<string, number> = {};
  let totalChars = 0;

  for (const att of attachments) {
    const ext = await extractAttachmentContent(att);
    extractions.push(ext);
    totalChars += ext.charCount;
    methods[ext.extractionMethod] = (methods[ext.extractionMethod] || 0) + 1;

    const pageCount = Math.max(1, ext.pageCount);
    const chunkSize = Math.ceil(ext.rawText.length / pageCount) || ext.rawText.length;
    for (let p = 0; p < pageCount; p++) {
      const slice = ext.rawText.slice(p * chunkSize, (p + 1) * chunkSize);
      pages.push({
        attachmentId: ext.attachmentId,
        fileName: ext.fileName,
        page: p + 1,
        charCount: slice.length,
        excerpt: slice.slice(0, 200).replace(/\s+/g, " ").trim(),
      });
    }
  }

  return {
    attachmentCount: attachments.length,
    totalChars,
    methods,
    pages,
    extractions,
  };
}
