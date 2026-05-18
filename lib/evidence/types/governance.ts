/**
 * V3.4-E8 Tender Governance Runtime — 类型契约
 */

import type { TenderAuditResult } from "./audit";
import type { EvidenceCoverageRuntimeResult } from "./coverage";
import type { TenderDecisionResult } from "./decision";
import type { TenderValidationRuntimeResult } from "./validation";

export const TENDER_GOVERNANCE_RUNTIME_VERSION = "3.4-e8" as const;

export type TenderGovernanceRuntimeVersion = typeof TENDER_GOVERNANCE_RUNTIME_VERSION;

export type GovernanceRiskLevel = "low" | "medium" | "high" | "critical";

export type GovernancePosture = "proceed" | "escalate" | "hold" | "halt";

export type GovernanceControlId =
  | "evidence_chain"
  | "mandatory_coverage"
  | "audit_trail"
  | "validation_gate"
  | "decision_alignment";

export type GovernanceControlCheck = {
  controlId: GovernanceControlId;
  passed: boolean;
  riskLevel: GovernanceRiskLevel;
  title: string;
  message: string;
};

export type GovernanceEscalation = {
  required: boolean;
  level: "none" | "manager" | "compliance" | "executive";
  reason: string;
};

export type GovernanceOversight = {
  riskLevel: GovernanceRiskLevel;
  posture: GovernancePosture;
  decisionStatus?: string;
  validationOutcome?: string;
  auditGovernance?: string;
  coverageScore?: number;
  controlsPassed: number;
  controlsFailed: number;
};

export type GovernanceInputsSnapshot = {
  decisionStatus?: string;
  decisionConfidence?: number;
  validationOutcome?: string;
  governanceStatus?: string;
  coverageScore?: number;
  coverageRatio?: number;
  mandatoryMissing?: number;
  auditEntries?: number;
};

export type GovernanceAuditEventKind =
  | "collect_inputs"
  | "assess_risk"
  | "run_controls"
  | "resolve_posture"
  | "escalation";

export type GovernanceAuditEvent = {
  eventId: string;
  runId: string;
  kind: GovernanceAuditEventKind;
  message: string;
  at: string;
  payload?: Record<string, unknown>;
};

export type GovernanceRuntimeTrace = {
  version: TenderGovernanceRuntimeVersion;
  runId: string;
  events: GovernanceAuditEvent[];
};

export type GovernancePolicy = Partial<{
  haltOnCriticalRisk: boolean;
  escalateOnHighRisk: boolean;
  requireAllControlsPass: boolean;
  executiveEscalationOnReject: boolean;
}>;

export const DEFAULT_GOVERNANCE_POLICY: Required<GovernancePolicy> = {
  haltOnCriticalRisk: true,
  escalateOnHighRisk: true,
  requireAllControlsPass: false,
  executiveEscalationOnReject: true,
};

export type TenderGovernanceResult = {
  version: TenderGovernanceRuntimeVersion;
  runId: string;
  ranAt: string;
  durationMs: number;
  documentId: string;
  riskLevel: GovernanceRiskLevel;
  posture: GovernancePosture;
  title: string;
  message: string;
  oversight: GovernanceOversight;
  controls: GovernanceControlCheck[];
  escalation: GovernanceEscalation;
  explain: string[];
  inputs: GovernanceInputsSnapshot;
  trace: GovernanceRuntimeTrace;
};

export type TenderGovernanceRuntimeInput = {
  runId: string;
  documentId: string;
  coverageRuntime?: EvidenceCoverageRuntimeResult;
  tenderValidation?: TenderValidationRuntimeResult;
  tenderAudit?: TenderAuditResult;
  tenderDecision?: TenderDecisionResult;
  policy?: GovernancePolicy;
};

export type TenderGovernanceRuntimeContract = {
  version: TenderGovernanceRuntimeVersion;
  pipeline: readonly [
    "collect_inputs",
    "assess_risk",
    "run_controls",
    "resolve_posture",
    "governance_result",
  ];
};

export const TENDER_GOVERNANCE_RUNTIME_CONTRACT: TenderGovernanceRuntimeContract = {
  version: TENDER_GOVERNANCE_RUNTIME_VERSION,
  pipeline: [
    "collect_inputs",
    "assess_risk",
    "run_controls",
    "resolve_posture",
    "governance_result",
  ],
};
