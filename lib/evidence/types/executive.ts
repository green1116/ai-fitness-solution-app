/**
 * V3.4-E9 Executive Oversight Runtime — 类型契约
 */

import type { TenderAuditResult } from "./audit";
import type { EvidenceCoverageRuntimeResult } from "./coverage";
import type { TenderDecisionResult } from "./decision";
import type { TenderGovernanceResult } from "./governance";
import type { EvidenceLinkingRuntimeResult } from "./linking";
import type { OcrDocumentResult } from "./ocr";
import type { TenderValidationRuntimeResult } from "./validation";

export const EXECUTIVE_OVERSIGHT_RUNTIME_VERSION = "3.4-e9" as const;

export type ExecutiveRiskLevel =
  | "acceptable"
  | "attention"
  | "high"
  | "critical";

export type ExecutiveFindingCategory =
  | "coverage"
  | "validation"
  | "audit"
  | "governance"
  | "compliance"
  | "traceability";

export type ExecutiveFinding = {
  id: string;
  category: ExecutiveFindingCategory;
  level: ExecutiveRiskLevel;
  summary: string;
  affectedRequirements?: string[];
  ocrRefs?: {
    page: number;
    blockId: string;
  }[];
};

export type ExecutiveRecommendation =
  | "approve"
  | "conditional-approve"
  | "review-required"
  | "reject";

export type ExecutiveOversightResult = {
  executiveApproved: boolean;
  executiveScore: number;
  findings: ExecutiveFinding[];
  recommendation: ExecutiveRecommendation;
};

export type ExecutiveRiskAssessment = {
  executiveRisk: ExecutiveRiskLevel;
  executiveScore: number;
};

export type ExecutiveScoreResult = {
  executiveScore: number;
  maxScore: number;
  executiveApproved: boolean;
};

/** buildExecutiveOversightRuntime 输入 */
export type BuildExecutiveOversightInput = {
  governance?: TenderGovernanceResult;
  audit?: TenderAuditResult;
  validation?: TenderValidationRuntimeResult;
  decision?: TenderDecisionResult;
  coverage?: EvidenceCoverageRuntimeResult;
  linking?: EvidenceLinkingRuntimeResult;
  ocrDocuments?: OcrDocumentResult[];
};

export type ExecutiveOversightPackage = ExecutiveOversightResult & {
  version: typeof EXECUTIVE_OVERSIGHT_RUNTIME_VERSION;
  risk: ExecutiveRiskAssessment;
  recommendations: string[];
  debug: ExecutiveDebugOutput;
};

export type ExecutiveDebugOutput = {
  summary: string;
  findings: string;
  criticalFindings: string;
  recommendations: string;
};

/**
 * 未来扩展点（本轮不实现）：AI executive / vector / semantic governance
 */
export type ExecutiveOversightExtensionHooks = {
  enableAiExecutiveReview?: boolean;
  enableSemanticGovernance?: boolean;
  enableVectorEvidenceRuntime?: boolean;
  providerId?: string;
};

export type ExecutiveOversightRuntimeContract = {
  version: typeof EXECUTIVE_OVERSIGHT_RUNTIME_VERSION;
  pipeline: readonly [
    "executive_risk",
    "executive_score",
    "findings",
    "recommendation_rules",
    "debug",
  ];
};

export const EXECUTIVE_OVERSIGHT_RUNTIME_CONTRACT: ExecutiveOversightRuntimeContract = {
  version: EXECUTIVE_OVERSIGHT_RUNTIME_VERSION,
  pipeline: [
    "executive_risk",
    "executive_score",
    "findings",
    "recommendation_rules",
    "debug",
  ],
};

// —— 兼容旧 E9 包装类型（供 runExecutiveOversightRuntime 适配）——

export type ExecutiveVerdict = "approve" | "approve_with_conditions" | "defer" | "deny";

export type ExecutiveOversightRuntimeInput = {
  runId: string;
  documentId: string;
  coverageRuntime?: EvidenceCoverageRuntimeResult;
  tenderValidation?: TenderValidationRuntimeResult;
  tenderAudit?: TenderAuditResult;
  tenderDecision?: TenderDecisionResult;
  tenderGovernance?: TenderGovernanceResult;
  linking?: EvidenceLinkingRuntimeResult;
  ocrDocuments?: OcrDocumentResult[];
  policy?: ExecutivePolicy;
  extensions?: ExecutiveOversightExtensionHooks;
};

/** 映射为 buildExecutiveOversightRuntime 输入 */
export function toBuildExecutiveOversightInput(
  input: ExecutiveOversightRuntimeInput,
): BuildExecutiveOversightInput {
  return {
    governance: input.tenderGovernance,
    audit: input.tenderAudit,
    validation: input.tenderValidation,
    decision: input.tenderDecision,
    coverage: input.coverageRuntime,
    linking: input.linking,
    ocrDocuments: input.ocrDocuments,
  };
}

export type ExecutiveInputsSnapshot = {
  decisionStatus?: string;
  validationOutcome?: string;
  governanceRisk?: string;
  governancePosture?: string;
  escalationRequired?: boolean;
  escalationLevel?: string;
};

export type ExecutiveKeyMetrics = {
  coverageScore?: number;
  coverageRatio?: number;
  decisionConfidence?: number;
  validationOutcome?: string;
  governanceRisk?: string;
  governancePosture?: string;
  auditEntries?: number;
  controlsPassed?: number;
  controlsFailed?: number;
};

export type ExecutiveSupervision = {
  riskLevel: ExecutiveRiskLevel;
  verdict: ExecutiveVerdict;
  requiresBoardReview: boolean;
  requiresComplianceSignoff: boolean;
  escalationLevel: "none" | "manager" | "compliance" | "executive";
};

export type ExecutiveBriefSection =
  | {
      id?: string;
      heading: string;
      body: string;
    }
  | {
      id: string;
      title: string;
      bullets: string[];
    };

export type ExecutiveAuditEventKind =
  | "executive_risk"
  | "executive_score"
  | "findings"
  | "recommendation_rules"
  | "debug"
  | "collect_inputs"
  | "assess_risk"
  | "build_brief"
  | "resolve_verdict"
  | "supervision";

export type ExecutiveAuditEvent = {
  eventId: string;
  runId: string;
  kind: ExecutiveAuditEventKind;
  message: string;
  at: string;
  payload?: Record<string, unknown>;
};

export type ExecutiveOversightTrace = {
  version: typeof EXECUTIVE_OVERSIGHT_RUNTIME_VERSION;
  runId: string;
  events: ExecutiveAuditEvent[];
};

/** @deprecated 使用 ExecutiveOversightTrace */
export type ExecutiveRuntimeTrace = ExecutiveOversightTrace;
export type ExecutiveRuntimeTraceEvent = ExecutiveAuditEvent;

export type ExecutivePolicy = {
  denyOnGovernanceHalt?: boolean;
  deferOnHighRisk?: boolean;
  boardReviewOnCritical?: boolean;
  requireComplianceSignoffOnEscalation?: boolean;
  approveThreshold?: number;
};

export const DEFAULT_EXECUTIVE_POLICY: Required<
  Pick<
    ExecutivePolicy,
    | "denyOnGovernanceHalt"
    | "deferOnHighRisk"
    | "boardReviewOnCritical"
    | "requireComplianceSignoffOnEscalation"
    | "approveThreshold"
  >
> = {
  denyOnGovernanceHalt: true,
  deferOnHighRisk: true,
  boardReviewOnCritical: true,
  requireComplianceSignoffOnEscalation: true,
  approveThreshold: 75,
};

/**
 * 完整高管监管结果（E9 主输出 + 兼容旧 brief/verdict/trace 字段）
 */
export type ExecutiveTenderResult = ExecutiveOversightPackage & {
  runId: string;
  ranAt: string;
  durationMs: number;
  documentId: string;
  riskLevel: ExecutiveRiskLevel;
  verdict: ExecutiveVerdict;
  title: string;
  message: string;
  brief: ExecutiveBriefSection[];
  keyMetrics: ExecutiveKeyMetrics;
  supervision: ExecutiveSupervision;
  explain: string[];
  inputs: ExecutiveInputsSnapshot;
  trace: ExecutiveOversightTrace;
};

export function recommendationToVerdict(
  recommendation: ExecutiveRecommendation,
): ExecutiveVerdict {
  switch (recommendation) {
    case "approve":
      return "approve";
    case "conditional-approve":
      return "approve_with_conditions";
    case "review-required":
      return "defer";
    case "reject":
      return "deny";
    default:
      return "defer";
  }
}

export function verdictTitle(verdict: ExecutiveVerdict): string {
  switch (verdict) {
    case "approve":
      return "高管监管：批准推进";
    case "approve_with_conditions":
      return "高管监管：有条件批准";
    case "defer":
      return "高管监管：暂缓决策";
    case "deny":
      return "高管监管：不予批准";
    default:
      return "高管监管";
  }
}

export function verdictMessage(verdict: ExecutiveVerdict): string {
  switch (verdict) {
    case "approve":
      return "证据链、治理与决策结论支持授权业务线进入投标执行阶段";
    case "approve_with_conditions":
      return "可在满足合规会签与列明条件后授权推进投标流程";
    case "defer":
      return "建议完成风险缓释与补充材料后再提请高管审批";
    case "deny":
      return "当前投标包不满足企业高层提交标准，不予批准推进";
    default:
      return "";
  }
}
