import type { BuildRuntimePolicyInput, RuntimePolicyMetrics } from "../types";
import {
  hasCriticalCompliance,
  ocrTraceabilityComplete,
} from "../runtime/buildExecutiveFindings";

/**
 * 从各层 runtime 提取 policy 评估指标（确定性）
 */
export function buildPolicyMetrics(input: BuildRuntimePolicyInput): RuntimePolicyMetrics {
  const cov = input.coverageRuntime;
  const val = input.tenderValidation;
  const audit = input.tenderAudit;
  const gov = input.tenderGovernance;
  const gate = input.executiveApprovalGate;
  const surface = input.executiveReleaseSurface;
  const oversight = input.executiveOversight;
  const corr = input.runtimeCorrelation;

  const executiveScore =
    gate?.executiveScore ??
    surface?.executiveScore ??
    oversight?.executiveScore ??
    0;

  const coverageRatio = cov?.summary.coverageRatio ?? 0;
  const validationScore = cov?.summary.validationScore ?? 0;
  const mandatoryMissing = cov?.summary.mandatoryMissing ?? 0;
  const criticalComplianceCount = val?.summary.criticalCount ?? 0;

  return {
    executiveScore,
    coverageRatio,
    validationScore,
    mandatoryMissing,
    criticalComplianceCount,
    auditBlocked: audit?.governanceStatus === "blocked",
    auditReviewRequired: audit?.governanceStatus === "review_required",
    governanceHalt: gov?.posture === "halt",
    governanceEscalate: gov?.posture === "escalate" || gov?.escalation.required === true,
    ocrTraceabilityComplete: ocrTraceabilityComplete(input),
    validationRejected: val?.outcome === "rejected",
    validationConditional: val?.outcome === "conditional",
    hasCriticalCompliance: hasCriticalCompliance(input),
    releasable: surface?.releasable ?? gate?.releasable ?? false,
    gateBlocked: gate?.status === "blocked",
    correlationEdgeCount: corr?.edges.length ?? 0,
    correlationCriticalPathCount: corr?.criticalPaths.length ?? 0,
    correlationWarningCount: corr?.correlationWarnings.length ?? 0,
  };
}
