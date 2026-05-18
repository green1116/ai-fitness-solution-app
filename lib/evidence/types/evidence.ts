/**
 * V3.4-E1 Evidence Runtime Foundation — 领域原语（与 tender/pdf/plan 解耦）
 */

export type AttachmentSourceType = "upload" | "zip" | "generated" | "scanned";

export type AttachmentFile = {
  id: string;
  fileName: string;
  mimeType: string;
  sourceType: AttachmentSourceType;
  size: number;
  uploadedAt: string;
  pages?: number;
  sha256?: string;
};

export type AttachmentPayload = {
  file: AttachmentFile;
  buffer: Buffer;
};

export type OcrMethod =
  | "plain_text"
  | "pdf_text"
  | "docx_text"
  | "filename_only"
  | "unsupported";

export type OcrPage = {
  attachmentId: string;
  page: number;
  charCount: number;
  excerpt: string;
};

export type OcrExtraction = {
  attachmentId: string;
  fileName: string;
  mimeType: string;
  method: OcrMethod;
  pageCount: number;
  charCount: number;
  rawText: string;
  excerpt: string;
  pages: OcrPage[];
};

export type EvidenceKind =
  | "datasheet"
  | "certification"
  | "test_report"
  | "case_study"
  | "warranty"
  | "sla"
  | "drawing"
  | "other";

export type SemanticClassification = {
  attachmentId: string;
  kind: EvidenceKind;
  label: string;
  confidence: number;
  tags: string[];
  /** 命中的确定性规则 id，便于审计回放 */
  ruleIds: string[];
};

export type RequirementAnchor = {
  id: string;
  text: string;
  category?: string;
  mandatory?: boolean;
};

export type EvidenceProvenance = {
  sourceKind: "attachment" | "internal" | "manual";
  sourceId: string;
  runtimeRunId: string;
  phaseId: string;
  ingestedAt: string;
};

export type EvidenceRecord = {
  id: string;
  attachmentId: string;
  title: string;
  kind: EvidenceKind;
  extractedText?: string;
  classification: SemanticClassification;
  provenance: EvidenceProvenance;
};

export type EvidenceLinkRecord = {
  requirementId: string;
  evidenceId: string;
  score: number;
  matchedTerms: string[];
};

export type EvidenceRegistryState = {
  records: EvidenceRecord[];
  links: EvidenceLinkRecord[];
};

export type CoverageLevel =
  | "fully_evidenced"
  | "partially_evidenced"
  | "unsupported"
  | "risky";

export type CoverageRecord = {
  requirementId: string;
  level: CoverageLevel;
  evidenceIds: string[];
  notes: string[];
};

export type CoverageSummary = {
  total: number;
  fully: number;
  partial: number;
  unsupported: number;
  risky: number;
  ratio: number;
};
