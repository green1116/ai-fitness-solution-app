/**
 * V3.3 OCR Intelligence & Attachment Evidence Layer
 *
 * 确定性外部附件理解（pdf-parse / mammoth / 规则分类，非 LLM chat）
 */
export * from "./types";
export { extractAttachmentContent } from "./extract/extractAttachmentContent";
export { classifyAttachment } from "./classify/classifyAttachment";
export { linkAttachmentsToRequirements } from "./link/linkAttachmentsToRequirements";
export { adaptAttachmentEvidence } from "./adapters/adaptAttachmentEvidence";
export { runAttachmentEvidenceIngest } from "./ingest/runAttachmentEvidenceIngest";
