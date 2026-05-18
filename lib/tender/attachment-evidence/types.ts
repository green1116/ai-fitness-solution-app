import type { EvidenceRegistry } from "@/lib/tender/evidence/types";
import type { EvidenceType } from "@/lib/tender/evidence/types";
import type { NormalizedEvidencePayload } from "@/lib/tender/evidence/adapters/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";

export type AttachmentExtractionMethod =
  | "pdf_text"
  | "docx_text"
  | "plain_text"
  | "filename_only"
  | "unsupported";

export type AttachmentInput = {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  attachmentCode?: string;
};

export type ExtractedAttachment = {
  attachmentId: string;
  fileName: string;
  mimeType?: string;
  extractionMethod: AttachmentExtractionMethod;
  pageCount: number;
  charCount: number;
  rawText: string;
  excerpt: string;
  evidenceType: EvidenceType;
  classificationLabel: string;
  classificationConfidence: number;
  semanticTags: string[];
  linkedRequirementIds: string[];
};

export type AttachmentLinkResult = {
  attachmentId: string;
  requirementId: string;
  score: number;
  matchedTerms: string[];
};

export type AttachmentIngestPhaseId =
  | "extract"
  | "classify"
  | "link"
  | "adapt"
  | "ingest";

export type AttachmentIngestPhaseResult = {
  phaseId: AttachmentIngestPhaseId;
  status: "completed" | "failed" | "skipped";
  message: string;
  durationMs: number;
  metrics?: Record<string, number | string | boolean>;
};

export type AttachmentEvidenceIntelligence = {
  version: "3.3";
  attachmentCount: number;
  extractedCount: number;
  linkedCount: number;
  payloadsCount: number;
  documentsAdded: number;
  linksAdded: number;
  byType: Partial<Record<EvidenceType, number>>;
  warnings: string[];
};

export type AttachmentEvidenceIngestResult = {
  ok: true;
  ingestId: string;
  ranAt: string;
  phases: AttachmentIngestPhaseResult[];
  extractions: ExtractedAttachment[];
  links: AttachmentLinkResult[];
  payloads: NormalizedEvidencePayload[];
  registry: EvidenceRegistry;
  intelligence: AttachmentEvidenceIntelligence;
};

export type AttachmentEvidenceIngestInput = {
  attachments: AttachmentInput[];
  graph?: TenderSemanticGraph;
  registry?: EvidenceRegistry;
  minLinkScore?: number;
};
