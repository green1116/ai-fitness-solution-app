/**
 * V3.4-E6 Tender Audit Runtime — 类型契约
 */

import type { EvidenceCoverageRuntimeResult } from "./coverage";
import type { AttachmentFile, EvidenceRegistryState } from "./evidence";
import type { EvidenceLinkingRuntimeResult } from "./linking";
import type { OcrDocumentResult } from "./ocr";
import type { RequirementItem } from "./requirement";
import type { EvidenceRuntimeTrace } from "./runtime";
import type { TenderValidationRuntimeResult } from "./validation";

export const TENDER_AUDIT_RUNTIME_VERSION = "3.4-e6" as const;

export type TenderAuditRuntimeVersion = typeof TENDER_AUDIT_RUNTIME_VERSION;

export type AuditEventType =
  | "requirement-linked"
  | "coverage-evaluated"
  | "validation-issued"
  | "ocr-trace-created"
  | "evidence-matched"
  | "compliance-flagged";

export type AuditSeverity = "info" | "notice" | "warning" | "critical";

export type AuditSourceRuntime =
  | "orchestration"
  | "ocr"
  | "linking"
  | "coverage"
  | "validation";

export type AuditTrailEntry = {
  id: string;
  runId: string;
  at: string;
  type: AuditEventType;
  severity: AuditSeverity;
  title: string;
  message: string;
  requirementId?: string;
  evidenceId?: string;
  attachmentId?: string;
  sourceRuntime: AuditSourceRuntime;
  sourceEventId?: string;
  payload?: Record<string, unknown>;
};

export type TenderAuditSummary = {
  totalEntries: number;
  byType: Partial<Record<AuditEventType, number>>;
  requirementCount: number;
  evidenceCount: number;
  ocrDocumentCount: number;
  linkCount: number;
  validationOutcome?: string;
  coverageScore?: number;
  criticalFindings: number;
};

export type TenderAuditTrail = {
  version: TenderAuditRuntimeVersion;
  runId: string;
  documentId: string;
  startedAt: string;
  finishedAt: string;
  entries: AuditTrailEntry[];
  summary: TenderAuditSummary;
};

export type TenderAuditGovernanceStatus = "clear" | "review_required" | "blocked";

export type TenderAuditResult = {
  version: TenderAuditRuntimeVersion;
  runId: string;
  ranAt: string;
  durationMs: number;
  documentId: string;
  trail: TenderAuditTrail;
  governanceStatus: TenderAuditGovernanceStatus;
  title: string;
  message: string;
  explain: string[];
};

export type TenderAuditRuntimeInput = {
  runId: string;
  documentId: string;
  startedAt: string;
  requirements: RequirementItem[];
  attachments?: AttachmentFile[];
  ocrDocuments?: OcrDocumentResult[];
  linking?: EvidenceLinkingRuntimeResult;
  coverageRuntime?: EvidenceCoverageRuntimeResult;
  tenderValidation?: TenderValidationRuntimeResult;
  registry?: EvidenceRegistryState;
  orchestrationTrace?: EvidenceRuntimeTrace;
};

export type TenderAuditRuntimeContract = {
  version: TenderAuditRuntimeVersion;
  pipeline: readonly [
    "collect_traces",
    "build_audit_trail",
    "governance_status",
    "audit_result",
  ];
};

export const TENDER_AUDIT_RUNTIME_CONTRACT: TenderAuditRuntimeContract = {
  version: TENDER_AUDIT_RUNTIME_VERSION,
  pipeline: ["collect_traces", "build_audit_trail", "governance_status", "audit_result"],
};
