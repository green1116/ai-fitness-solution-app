/**
 * V3.4-E15 Runtime State Machine — 类型契约
 */

import type { TenderAuditResult } from "./audit";
import type { EvidenceCoverageRuntimeResult } from "./coverage";
import type { TenderDecisionResult } from "./decision";
import type { ExecutiveApprovalGateRuntimeResult } from "./executiveGate";
import type { ExecutiveOversightPackage, ExecutiveTenderResult } from "./executive";
import type {
  ExecutiveReleaseSurface,
  ExecutiveReleaseSurfaceRuntimeResult,
} from "./executiveReleaseSurface";
import type { TenderGovernanceResult } from "./governance";
import type { EvidenceLinkingRuntimeResult } from "./linking";
import type { OcrDocumentResult } from "./ocr";
import type { ExternalEvidenceRuntimeSuccess } from "./runtime";
import type { RuntimeCorrelationIntelligenceResult } from "./runtimeCorrelation";
import type { RuntimePolicyEngineResult } from "./runtimePolicy";
import type { TenderValidationRuntimeResult } from "./validation";

export const RUNTIME_STATE_MACHINE_VERSION = "3.4-e15" as const;

export type RuntimeLifecycleState =
  | "draft"
  | "evidence-pending"
  | "ocr-verified"
  | "coverage-passed"
  | "validation-passed"
  | "audit-reviewed"
  | "governance-approved"
  | "executive-approved"
  | "release-approved"
  | "released"
  | "conditional-release"
  | "release-blocked"
  | "executive-escalation";

export type RuntimeStateTransitionReason =
  | "evidence-complete"
  | "ocr-verified"
  | "coverage-passed"
  | "validation-failed"
  | "audit-failed"
  | "governance-failed"
  | "executive-approved"
  | "policy-blocked"
  | "conditional-release-triggered";

export type RuntimeStateTransition = {
  from: RuntimeLifecycleState;
  to: RuntimeLifecycleState;
  reason: RuntimeStateTransitionReason;
  deterministic: true;
  timestamp: string;
};

export type RuntimeStateMachineResult = {
  currentState: RuntimeLifecycleState;
  previousState?: RuntimeLifecycleState;
  transitions: RuntimeStateTransition[];
  releasable: boolean;
  escalationRequired: boolean;
};

export type RuntimeStateMachineDebugOutput = {
  summary: string;
  transitionLog: string;
  lifecycleStatus: string;
};

export type RuntimeStateMachinePackage = RuntimeStateMachineResult & {
  version: typeof RUNTIME_STATE_MACHINE_VERSION;
  debug: RuntimeStateMachineDebugOutput;
};

export type BuildRuntimeStateMachineInput = {
  runId?: string;
  ranAt?: string;
  coverageRuntime?: EvidenceCoverageRuntimeResult;
  tenderValidation?: TenderValidationRuntimeResult;
  tenderAudit?: TenderAuditResult;
  tenderDecision?: TenderDecisionResult;
  tenderGovernance?: TenderGovernanceResult;
  executiveOversight?: ExecutiveTenderResult | ExecutiveOversightPackage;
  executiveApprovalGate?: ExecutiveApprovalGateRuntimeResult;
  executiveReleaseSurface?: ExecutiveReleaseSurfaceRuntimeResult | ExecutiveReleaseSurface;
  runtimeCorrelation?: RuntimeCorrelationIntelligenceResult;
  runtimePolicy?: RuntimePolicyEngineResult;
  linking?: EvidenceLinkingRuntimeResult;
  ocrDocuments?: OcrDocumentResult[];
  attachmentCount?: number;
};

export function runtimeStateMachineInputFromSuccess(
  result: ExternalEvidenceRuntimeSuccess,
): BuildRuntimeStateMachineInput {
  return {
    runId: result.runId,
    ranAt: result.ranAt,
    coverageRuntime: result.coverageRuntime,
    tenderValidation: result.tenderValidation,
    tenderAudit: result.tenderAudit,
    tenderDecision: result.tenderDecision,
    tenderGovernance: result.tenderGovernance,
    executiveOversight: result.executiveOversight,
    executiveApprovalGate: result.executiveApprovalGate,
    executiveReleaseSurface: result.executiveReleaseSurface,
    runtimeCorrelation: result.runtimeCorrelation,
    runtimePolicy: result.runtimePolicy,
    linking: result.linking,
    ocrDocuments: result.ocrDocuments,
    attachmentCount: result.attachments?.length,
  };
}

export type RuntimeStateMachineRuntimeInput = BuildRuntimeStateMachineInput & {
  runId: string;
  extensions?: RuntimeStateMachineExtensionHooks;
};

export type RuntimeStateMachineExtensionHooks = {
  enableAiStateInference?: boolean;
  enableSemanticLifecycle?: boolean;
  providerId?: string;
};

export type RuntimeStateMachineContract = {
  version: typeof RUNTIME_STATE_MACHINE_VERSION;
  pipeline: readonly [
    "initialize_draft",
    "progress_evidence",
    "progress_governance",
    "resolve_terminal_state",
    "debug",
  ];
};

export const RUNTIME_STATE_MACHINE_CONTRACT: RuntimeStateMachineContract = {
  version: RUNTIME_STATE_MACHINE_VERSION,
  pipeline: [
    "initialize_draft",
    "progress_evidence",
    "progress_governance",
    "resolve_terminal_state",
    "debug",
  ],
};

export type StateMachineAuditEventKind =
  | "initialize_draft"
  | "progress_evidence"
  | "progress_governance"
  | "resolve_terminal_state"
  | "debug";

export type StateMachineAuditEvent = {
  eventId: string;
  runId: string;
  kind: StateMachineAuditEventKind;
  message: string;
  at: string;
  payload?: Record<string, unknown>;
};

export type StateMachineTrace = {
  version: typeof RUNTIME_STATE_MACHINE_VERSION;
  runId: string;
  events: StateMachineAuditEvent[];
};

export type RuntimeStateMachineRuntimeResult = RuntimeStateMachinePackage & {
  runId: string;
  ranAt: string;
  durationMs: number;
  trace: StateMachineTrace;
};
