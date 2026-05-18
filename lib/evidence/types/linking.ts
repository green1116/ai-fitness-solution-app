/**
 * V3.4-E3 Evidence Linking Runtime — 类型契约
 */

import type { CoverageLevel, EvidenceKind, EvidenceLinkRecord, EvidenceRegistryState } from "./evidence";
import type { OcrCoordinate } from "./ocr";
import type { RequirementItem } from "./requirement";

export const LINKING_RUNTIME_VERSION = "3.4-e3" as const;

export type LinkingRuntimeVersion = typeof LINKING_RUNTIME_VERSION;

export type KeywordMappingSource = "explicit" | "extracted" | "title";

/** 需求 → 关键词映射（可解释） */
export type KeywordMapping = {
  requirementId: string;
  keywords: string[];
  expandedTerms: string[];
  sources: KeywordMappingSource[];
};

/** OCR 命中位置（块级 + 坐标） */
export type OcrLocation = {
  attachmentId: string;
  blockId: string;
  page: number;
  charStart: number;
  charEnd: number;
  excerpt: string;
  matchedTerm: string;
  coordinates?: OcrCoordinate;
};

/** 单条需求-证据匹配 */
export type EvidenceMatch = {
  linkId: string;
  requirementId: string;
  evidenceId: string;
  attachmentId: string;
  score: number;
  confidence: number;
  matchedTerms: string[];
  keywordHits: string[];
  locations: OcrLocation[];
  classificationKind?: EvidenceKind;
  explain: string[];
};

/** 单需求关联结果 */
export type RequirementLinkingResult = {
  requirementId: string;
  requirementTitle: string;
  mapping: KeywordMapping;
  matches: EvidenceMatch[];
  bestScore: number;
  coverageLevel: CoverageLevel;
  coverageNotes: string[];
};

export type LinkingAuditEventKind =
  | "index_built"
  | "keyword_map"
  | "evidence_match"
  | "ocr_locate"
  | "coverage";

export type LinkingAuditEvent = {
  eventId: string;
  runId: string;
  kind: LinkingAuditEventKind;
  message: string;
  at: string;
  requirementId?: string;
  payload?: Record<string, unknown>;
};

export type LinkingRuntimeTrace = {
  version: LinkingRuntimeVersion;
  runId: string;
  events: LinkingAuditEvent[];
};

export type EvidenceLinkingRuntimeInput = {
  runId?: string;
  requirements: RequirementItem[];
  ocrDocuments: import("./ocr").OcrDocumentResult[];
  classifications: import("./evidence").SemanticClassification[];
  registry: EvidenceRegistryState;
  minLinkScore?: number;
  minConfidence?: number;
};

export type EvidenceLinkingRuntimeResult = {
  version: LinkingRuntimeVersion;
  runId: string;
  ranAt: string;
  durationMs: number;
  requirements: RequirementItem[];
  results: RequirementLinkingResult[];
  registry: EvidenceRegistryState;
  links: EvidenceLinkRecord[];
  matches: EvidenceMatch[];
  trace: LinkingRuntimeTrace;
};

export type EvidenceLinkingRuntimeContract = {
  version: LinkingRuntimeVersion;
  pipeline: readonly [
    "keyword_mapping",
    "evidence_match",
    "ocr_locate",
    "coverage_status",
  ];
};

export const EVIDENCE_LINKING_RUNTIME_CONTRACT: EvidenceLinkingRuntimeContract = {
  version: LINKING_RUNTIME_VERSION,
  pipeline: ["keyword_mapping", "evidence_match", "ocr_locate", "coverage_status"],
};
