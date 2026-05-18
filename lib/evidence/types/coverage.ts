/**
 * V3.4-E4 Evidence Coverage Runtime — 类型契约
 */

import type { CoverageLevel, CoverageRecord, CoverageSummary } from "./evidence";
import type { EvidenceLinkingRuntimeResult, RequirementLinkingResult } from "./linking";
import type { RequirementItem } from "./requirement";

export const COVERAGE_RUNTIME_VERSION = "3.4-e4" as const;

export type CoverageRuntimeVersion = typeof COVERAGE_RUNTIME_VERSION;

export type CoverageStatus =
  | "covered"
  | "partial"
  | "missing"
  | "conflict"
  | "unknown";

export type CoverageAnalysis = {
  requirementId: string;
  requirementTitle: string;
  mandatory: boolean;
  matchCount: number;
  bestScore: number;
  avgConfidence: number;
  evidenceIds: string[];
  keywordCoverageRatio: number;
  hasOcrLocation: boolean;
  conflictSignals: string[];
  findings: string[];
};

export type RequirementCoverageResult = {
  requirementId: string;
  requirementTitle: string;
  status: CoverageStatus;
  analysis: CoverageAnalysis;
  /** E1 兼容层级 */
  legacyLevel: CoverageLevel;
  explain: string[];
};

export type TenderValidationVerdict = "pass" | "conditional" | "fail" | "incomplete";

export type CoverageRuntimeSummary = {
  total: number;
  covered: number;
  partial: number;
  missing: number;
  conflict: number;
  unknown: number;
  mandatoryMissing: number;
  mandatoryConflict: number;
  coverageRatio: number;
  validationScore: number;
};

export type CoverageAuditEventKind =
  | "analyze"
  | "resolve_status"
  | "validate"
  | "warning";

export type CoverageAuditEvent = {
  eventId: string;
  runId: string;
  kind: CoverageAuditEventKind;
  message: string;
  at: string;
  requirementId?: string;
  payload?: Record<string, unknown>;
};

export type CoverageRuntimeTrace = {
  version: CoverageRuntimeVersion;
  runId: string;
  events: CoverageAuditEvent[];
};

export type CoveragePolicy = Partial<{
  coveredMinScore: number;
  partialMinScore: number;
  coveredKeywordRatio: number;
  failOnMandatoryMissing: boolean;
  conditionalOnConflict: boolean;
  conditionalPartialRatio: number;
}>;

export const DEFAULT_COVERAGE_POLICY: Required<CoveragePolicy> = {
  coveredMinScore: 0.65,
  partialMinScore: 0.4,
  coveredKeywordRatio: 0.5,
  failOnMandatoryMissing: true,
  conditionalOnConflict: true,
  conditionalPartialRatio: 0.35,
};

export type TenderValidationResult = {
  version: CoverageRuntimeVersion;
  verdict: TenderValidationVerdict;
  title: string;
  message: string;
  reasons: string[];
  suggestedActions: string[];
};

export type EvidenceCoverageRuntimeInput = {
  runId?: string;
  requirements: RequirementItem[];
  linking: EvidenceLinkingRuntimeResult;
  policy?: CoveragePolicy;
};

export type EvidenceCoverageRuntimeResult = {
  version: CoverageRuntimeVersion;
  runId: string;
  ranAt: string;
  durationMs: number;
  requirements: RequirementCoverageResult[];
  summary: CoverageRuntimeSummary;
  validation: TenderValidationResult;
  /** E1 兼容 */
  legacyCoverage: CoverageRecord[];
  legacySummary: CoverageSummary;
  trace: CoverageRuntimeTrace;
};

export type EvidenceCoverageRuntimeContract = {
  version: CoverageRuntimeVersion;
  pipeline: readonly [
    "evidence_match",
    "coverage_analysis",
    "coverage_status",
    "tender_validation",
  ];
};

export const EVIDENCE_COVERAGE_RUNTIME_CONTRACT: EvidenceCoverageRuntimeContract = {
  version: COVERAGE_RUNTIME_VERSION,
  pipeline: [
    "evidence_match",
    "coverage_analysis",
    "coverage_status",
    "tender_validation",
  ],
};

export type CoverageFromLinkingInput = {
  requirements: RequirementItem[];
  linkingResults: RequirementLinkingResult[];
  policy?: CoveragePolicy;
};
