/**
 * V3.4-E14 Runtime Policy Engine — 类型契约
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
import type { TenderValidationRuntimeResult } from "./validation";

export const RUNTIME_POLICY_ENGINE_VERSION = "3.4-e14" as const;

export type RuntimePolicyOperator =
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "eq"
  | "neq";

export type RuntimePolicyAction =
  | "block-release"
  | "conditional-release"
  | "require-executive-review"
  | "raise-governance-warning"
  | "raise-audit-warning";

export type RuntimePolicyRule = {
  id: string;
  metric: string;
  operator: RuntimePolicyOperator;
  value: number | boolean | string;
  action: RuntimePolicyAction;
  deterministic: true;
};

export type RuntimePolicyResult = {
  triggeredPolicies: string[];
  actions: RuntimePolicyAction[];
  blocked: boolean;
  conditionalRelease: boolean;
  executiveReviewRequired: boolean;
  warnings: string[];
};

export type RuntimePolicyMetrics = Record<string, number | boolean | string>;

export type RuntimePolicyDebugOutput = {
  summary: string;
  triggeredRules: string;
  metricsSnapshot: string;
};

export type RuntimePolicyPackage = RuntimePolicyResult & {
  version: typeof RUNTIME_POLICY_ENGINE_VERSION;
  metrics: RuntimePolicyMetrics;
  rulesEvaluated: number;
  debug: RuntimePolicyDebugOutput;
};

export type BuildRuntimePolicyInput = {
  runId?: string;
  policies?: RuntimePolicyRule[];
  coverageRuntime?: EvidenceCoverageRuntimeResult;
  tenderValidation?: TenderValidationRuntimeResult;
  tenderAudit?: TenderAuditResult;
  tenderDecision?: TenderDecisionResult;
  tenderGovernance?: TenderGovernanceResult;
  executiveOversight?: ExecutiveTenderResult | ExecutiveOversightPackage;
  executiveApprovalGate?: ExecutiveApprovalGateRuntimeResult;
  executiveReleaseSurface?: ExecutiveReleaseSurfaceRuntimeResult | ExecutiveReleaseSurface;
  runtimeCorrelation?: RuntimeCorrelationIntelligenceResult;
  linking?: EvidenceLinkingRuntimeResult;
  ocrDocuments?: OcrDocumentResult[];
};

export function runtimePolicyInputFromSuccess(
  result: ExternalEvidenceRuntimeSuccess,
  policies?: RuntimePolicyRule[],
): BuildRuntimePolicyInput {
  return {
    runId: result.runId,
    policies,
    coverageRuntime: result.coverageRuntime,
    tenderValidation: result.tenderValidation,
    tenderAudit: result.tenderAudit,
    tenderDecision: result.tenderDecision,
    tenderGovernance: result.tenderGovernance,
    executiveOversight: result.executiveOversight,
    executiveApprovalGate: result.executiveApprovalGate,
    executiveReleaseSurface: result.executiveReleaseSurface,
    runtimeCorrelation: result.runtimeCorrelation,
    linking: result.linking,
    ocrDocuments: result.ocrDocuments,
  };
}

export type RuntimePolicyEngineRuntimeInput = BuildRuntimePolicyInput & {
  runId: string;
  extensions?: RuntimePolicyExtensionHooks;
};

export type RuntimePolicyExtensionHooks = {
  enableAiPolicyInference?: boolean;
  enableSemanticPolicyRuntime?: boolean;
  enableVectorPolicyStore?: boolean;
  providerId?: string;
};

export type RuntimePolicyEngineContract = {
  version: typeof RUNTIME_POLICY_ENGINE_VERSION;
  pipeline: readonly [
    "collect_metrics",
    "load_policies",
    "evaluate_rules",
    "aggregate_actions",
    "debug",
  ];
};

export const RUNTIME_POLICY_ENGINE_CONTRACT: RuntimePolicyEngineContract = {
  version: RUNTIME_POLICY_ENGINE_VERSION,
  pipeline: [
    "collect_metrics",
    "load_policies",
    "evaluate_rules",
    "aggregate_actions",
    "debug",
  ],
};

export type PolicyAuditEventKind =
  | "collect_metrics"
  | "load_policies"
  | "evaluate_rules"
  | "aggregate_actions"
  | "debug";

export type PolicyAuditEvent = {
  eventId: string;
  runId: string;
  kind: PolicyAuditEventKind;
  message: string;
  at: string;
  payload?: Record<string, unknown>;
};

export type PolicyTrace = {
  version: typeof RUNTIME_POLICY_ENGINE_VERSION;
  runId: string;
  events: PolicyAuditEvent[];
};

export type RuntimePolicyEngineResult = RuntimePolicyPackage & {
  runId: string;
  ranAt: string;
  durationMs: number;
  trace: PolicyTrace;
};
