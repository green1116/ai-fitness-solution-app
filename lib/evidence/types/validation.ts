/**
 * V3.4-E5 Tender Validation Runtime — 类型契约
 */

import type { AttachmentFile, EvidenceRegistryState } from "./evidence";
import type { EvidenceCoverageRuntimeResult } from "./coverage";
import type { EvidenceLinkingRuntimeResult } from "./linking";
import type { RequirementItem } from "./requirement";

export const TENDER_VALIDATION_RUNTIME_VERSION = "3.4-e5" as const;

export type TenderValidationRuntimeVersion = typeof TENDER_VALIDATION_RUNTIME_VERSION;

export type ValidationSeverity = "info" | "warning" | "error" | "critical";

export type ValidationOutcome = "approved" | "conditional" | "rejected" | "incomplete";

export type TenderDocumentRef = {
  documentId: string;
  fileName?: string;
  tenderTitle?: string;
  sourceType?: "upload" | "paste" | "generated";
  charCount?: number;
};

export type ValidationFinding = {
  id: string;
  ruleId: string;
  severity: ValidationSeverity;
  code: string;
  title: string;
  message: string;
  requirementId?: string;
  evidenceId?: string;
  explain: string[];
};

export type ComplianceCheckResult = {
  checkId: string;
  passed: boolean;
  severity: ValidationSeverity;
  title: string;
  message: string;
  relatedFindingIds: string[];
};

export type ValidationSummary = {
  findingCount: number;
  criticalCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  compliancePassed: number;
  complianceFailed: number;
  validationScore: number;
  coverageRatio: number;
};

export type ValidationAuditEventKind =
  | "document"
  | "requirements"
  | "coverage"
  | "rule"
  | "compliance"
  | "outcome";

export type ValidationAuditEvent = {
  eventId: string;
  runId: string;
  kind: ValidationAuditEventKind;
  message: string;
  at: string;
  payload?: Record<string, unknown>;
};

export type TenderAuditTrace = {
  version: TenderValidationRuntimeVersion;
  runId: string;
  documentId: string;
  events: ValidationAuditEvent[];
};

export type ValidationPolicy = Partial<{
  minValidationScore: number;
  minCoverageRatio: number;
  rejectOnCritical: boolean;
  rejectOnError: boolean;
  requireAttachments: boolean;
}>;

export const DEFAULT_VALIDATION_POLICY: Required<ValidationPolicy> = {
  minValidationScore: 60,
  minCoverageRatio: 0.5,
  rejectOnCritical: true,
  rejectOnError: true,
  requireAttachments: true,
};

export type TenderValidationRuntimeInput = {
  runId?: string;
  document: TenderDocumentRef;
  requirements: RequirementItem[];
  coverageRuntime: EvidenceCoverageRuntimeResult;
  linking?: EvidenceLinkingRuntimeResult;
  registry?: EvidenceRegistryState;
  attachments?: AttachmentFile[];
  policy?: ValidationPolicy;
};

export type TenderValidationRuntimeResult = {
  version: TenderValidationRuntimeVersion;
  runId: string;
  ranAt: string;
  durationMs: number;
  document: TenderDocumentRef;
  outcome: ValidationOutcome;
  title: string;
  message: string;
  reasons: string[];
  suggestedActions: string[];
  findings: ValidationFinding[];
  complianceChecks: ComplianceCheckResult[];
  summary: ValidationSummary;
  /** E4 覆盖校验结论（保留引用） */
  coverageValidation: EvidenceCoverageRuntimeResult["validation"];
  audit: TenderAuditTrace;
};

export type TenderValidationRuntimeContract = {
  version: TenderValidationRuntimeVersion;
  pipeline: readonly [
    "requirement_runtime",
    "evidence_coverage",
    "validation_rules",
    "compliance_check",
    "validation_result",
    "tender_audit",
  ];
};

export const TENDER_VALIDATION_RUNTIME_CONTRACT: TenderValidationRuntimeContract = {
  version: TENDER_VALIDATION_RUNTIME_VERSION,
  pipeline: [
    "requirement_runtime",
    "evidence_coverage",
    "validation_rules",
    "compliance_check",
    "validation_result",
    "tender_audit",
  ],
};
