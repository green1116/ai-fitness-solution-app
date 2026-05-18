/**
 * V3.4-E10 Executive Approval Gate Runtime — 类型契约
 */

import type { TenderAuditResult } from "./audit";
import type { EvidenceCoverageRuntimeResult } from "./coverage";
import type { TenderDecisionResult } from "./decision";
import type {
  BuildExecutiveOversightInput,
  ExecutiveOversightPackage,
  ExecutiveOversightResult,
} from "./executive";
import type { TenderGovernanceResult } from "./governance";
import type { EvidenceLinkingRuntimeResult } from "./linking";
import type { OcrDocumentResult } from "./ocr";
import type { TenderValidationRuntimeResult } from "./validation";

export const EXECUTIVE_APPROVAL_GATE_RUNTIME_VERSION = "3.4-e10" as const;

export type ExecutiveGateStatus = "approved" | "conditional" | "blocked";

export type ExecutiveGateReason =
  | "critical-compliance-risk"
  | "missing-critical-evidence"
  | "weak-ocr-traceability"
  | "governance-failed"
  | "audit-failed"
  | "validation-unresolved";

export type ExecutiveGateRecommendation =
  | "release"
  | "conditional-release"
  | "block-release";

export type TenderReleaseDecision =
  | "release-authorized"
  | "release-held"
  | "release-denied";

export type ExecutiveApprovalGateResult = {
  status: ExecutiveGateStatus;
  releasable: boolean;
  reasons: ExecutiveGateReason[];
  executiveScore: number;
  recommendation: ExecutiveGateRecommendation;
  tenderReleaseDecision: TenderReleaseDecision;
};

export type ExecutiveGateDebugOutput = {
  summary: string;
  gateStatus: string;
  blockReasons: string;
  releaseConditions: string;
};

export type ExecutiveApprovalGatePackage = ExecutiveApprovalGateResult & {
  version: typeof EXECUTIVE_APPROVAL_GATE_RUNTIME_VERSION;
  debug: ExecutiveGateDebugOutput;
};

/** buildExecutiveApprovalGate 输入 */
export type BuildExecutiveApprovalGateInput = BuildExecutiveOversightInput & {
  executiveOversight: ExecutiveOversightResult | ExecutiveOversightPackage;
};

export type ExecutiveGatePolicy = {
  /** 放行最低高管分，默认 75 */
  minReleaseScore?: number;
  /** 是否允许 conditional-release 标记为可释放（仍须合规会签） */
  allowConditionalRelease?: boolean;
};

export type ExecutiveApprovalGateRuntimeInput = BuildExecutiveApprovalGateInput & {
  runId: string;
  documentId: string;
  coverageRuntime?: EvidenceCoverageRuntimeResult;
  tenderValidation?: TenderValidationRuntimeResult;
  tenderAudit?: TenderAuditResult;
  tenderDecision?: TenderDecisionResult;
  tenderGovernance?: TenderGovernanceResult;
  executiveOversight: ExecutiveOversightPackage | ExecutiveOversightResult;
  linking?: EvidenceLinkingRuntimeResult;
  ocrDocuments?: OcrDocumentResult[];
  policy?: ExecutiveGatePolicy;
  extensions?: ExecutiveGateExtensionHooks;
};

export function toBuildExecutiveApprovalGateInput(
  input: ExecutiveApprovalGateRuntimeInput,
): BuildExecutiveApprovalGateInput {
  return {
    governance: input.tenderGovernance ?? input.governance,
    audit: input.tenderAudit ?? input.audit,
    validation: input.tenderValidation ?? input.validation,
    decision: input.tenderDecision ?? input.decision,
    coverage: input.coverageRuntime ?? input.coverage,
    linking: input.linking,
    ocrDocuments: input.ocrDocuments,
    executiveOversight: input.executiveOversight,
  };
}

/**
 * 未来扩展点（本轮不实现）：AI release / semantic gate
 */
export type ExecutiveGateExtensionHooks = {
  enableAiReleaseDecision?: boolean;
  enableSemanticReleaseGate?: boolean;
  enableVectorReleaseRuntime?: boolean;
  providerId?: string;
};

export type ExecutiveApprovalGateRuntimeContract = {
  version: typeof EXECUTIVE_APPROVAL_GATE_RUNTIME_VERSION;
  pipeline: readonly [
    "collect_reasons",
    "evaluate_oversight",
    "resolve_gate",
    "tender_release_decision",
    "debug",
  ];
};

export const EXECUTIVE_APPROVAL_GATE_RUNTIME_CONTRACT: ExecutiveApprovalGateRuntimeContract =
  {
    version: EXECUTIVE_APPROVAL_GATE_RUNTIME_VERSION,
    pipeline: [
      "collect_reasons",
      "evaluate_oversight",
      "resolve_gate",
      "tender_release_decision",
      "debug",
    ],
  };

export const DEFAULT_EXECUTIVE_GATE_POLICY: Required<
  Pick<ExecutiveGatePolicy, "minReleaseScore" | "allowConditionalRelease">
> = {
  minReleaseScore: 75,
  allowConditionalRelease: false,
};

export type ExecutiveGateAuditEventKind =
  | "collect_reasons"
  | "evaluate_oversight"
  | "resolve_gate"
  | "tender_release_decision"
  | "debug";

export type ExecutiveGateAuditEvent = {
  eventId: string;
  runId: string;
  kind: ExecutiveGateAuditEventKind;
  message: string;
  at: string;
  payload?: Record<string, unknown>;
};

export type ExecutiveGateTrace = {
  version: typeof EXECUTIVE_APPROVAL_GATE_RUNTIME_VERSION;
  runId: string;
  events: ExecutiveGateAuditEvent[];
};

/** 含 trace 的完整 gate 运行时结果 */
export type ExecutiveApprovalGateRuntimeResult = ExecutiveApprovalGatePackage & {
  runId: string;
  ranAt: string;
  durationMs: number;
  documentId: string;
  trace: ExecutiveGateTrace;
};
