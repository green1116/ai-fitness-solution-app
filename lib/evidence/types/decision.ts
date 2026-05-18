/**
 * V3.4-E7 Tender Decision Runtime — 类型契约
 */

import type { TenderAuditResult } from "./audit";
import type { EvidenceCoverageRuntimeResult } from "./coverage";
import type { EvidenceLinkingRuntimeResult } from "./linking";
import type { TenderValidationRuntimeResult } from "./validation";

export const TENDER_DECISION_RUNTIME_VERSION = "3.4-e7" as const;

export type TenderDecisionRuntimeVersion = typeof TENDER_DECISION_RUNTIME_VERSION;

export type TenderDecisionStatus =
  | "recommended"
  | "conditional"
  | "high-risk"
  | "rejected";

export type DecisionFactorCategory =
  | "coverage"
  | "validation"
  | "audit"
  | "evidence"
  | "mandatory";

export type DecisionFactorSeverity = "info" | "notice" | "warning" | "critical";

export type DecisionFactor = {
  id: string;
  category: DecisionFactorCategory;
  severity: DecisionFactorSeverity;
  weight: number;
  message: string;
  requirementId?: string;
};

export type DecisionInputsSnapshot = {
  validationOutcome?: string;
  governanceStatus?: string;
  coverageScore?: number;
  coverageRatio?: number;
  mandatoryMissing?: number;
  mandatoryConflict?: number;
  linkCount?: number;
  auditEntryCount?: number;
};

export type DecisionAuditEventKind =
  | "collect_inputs"
  | "build_factors"
  | "resolve_status"
  | "finalize";

export type DecisionAuditEvent = {
  eventId: string;
  runId: string;
  kind: DecisionAuditEventKind;
  message: string;
  at: string;
  payload?: Record<string, unknown>;
};

export type DecisionRuntimeTrace = {
  version: TenderDecisionRuntimeVersion;
  runId: string;
  events: DecisionAuditEvent[];
};

export type DecisionPolicy = Partial<{
  rejectOnAuditBlocked: boolean;
  minScoreForRecommended: number;
  minCoverageRatioForRecommended: number;
  highRiskOnMandatoryPartial: boolean;
}>;

export const DEFAULT_DECISION_POLICY: Required<DecisionPolicy> = {
  rejectOnAuditBlocked: true,
  minScoreForRecommended: 70,
  minCoverageRatioForRecommended: 0.65,
  highRiskOnMandatoryPartial: true,
};

export type TenderDecisionResult = {
  version: TenderDecisionRuntimeVersion;
  runId: string;
  ranAt: string;
  durationMs: number;
  documentId: string;
  status: TenderDecisionStatus;
  title: string;
  message: string;
  /** 确定性置信度 0–1（由规则加权，非 ML） */
  confidence: number;
  factors: DecisionFactor[];
  reasons: string[];
  recommendedActions: string[];
  inputs: DecisionInputsSnapshot;
  trace: DecisionRuntimeTrace;
};

export type TenderDecisionRuntimeInput = {
  runId: string;
  documentId: string;
  coverageRuntime?: EvidenceCoverageRuntimeResult;
  tenderValidation?: TenderValidationRuntimeResult;
  tenderAudit?: TenderAuditResult;
  linking?: EvidenceLinkingRuntimeResult;
  policy?: DecisionPolicy;
};

export type TenderDecisionRuntimeContract = {
  version: TenderDecisionRuntimeVersion;
  pipeline: readonly [
    "collect_inputs",
    "build_factors",
    "resolve_status",
    "decision_result",
  ];
};

export const TENDER_DECISION_RUNTIME_CONTRACT: TenderDecisionRuntimeContract = {
  version: TENDER_DECISION_RUNTIME_VERSION,
  pipeline: ["collect_inputs", "build_factors", "resolve_status", "decision_result"],
};
