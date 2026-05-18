import type {
  GovernanceInputsSnapshot,
  GovernanceRiskLevel,
  TenderGovernanceRuntimeInput,
} from "../types";

export function buildGovernanceInputsSnapshot(
  input: TenderGovernanceRuntimeInput,
): GovernanceInputsSnapshot {
  const dec = input.tenderDecision;
  const cov = input.coverageRuntime;
  const val = input.tenderValidation;
  const audit = input.tenderAudit;

  return {
    decisionStatus: dec?.status,
    decisionConfidence: dec?.confidence,
    validationOutcome: val?.outcome,
    governanceStatus: audit?.governanceStatus,
    coverageScore: cov?.summary.validationScore,
    coverageRatio: cov?.summary.coverageRatio,
    mandatoryMissing: cov?.summary.mandatoryMissing,
    auditEntries: audit?.trail.summary.totalEntries,
  };
}

/**
 * 治理风险等级（确定性，综合 Decision / Validation / Audit / Coverage）
 */
export function assessGovernanceRisk(
  inputs: GovernanceInputsSnapshot,
): GovernanceRiskLevel {
  if (
    inputs.decisionStatus === "rejected" ||
    inputs.validationOutcome === "rejected" ||
    inputs.governanceStatus === "blocked"
  ) {
    return "critical";
  }

  if (
    inputs.decisionStatus === "high-risk" ||
    (inputs.mandatoryMissing ?? 0) > 0 ||
    inputs.governanceStatus === "review_required"
  ) {
    return "high";
  }

  if (
    inputs.decisionStatus === "conditional" ||
    inputs.validationOutcome === "conditional" ||
    (inputs.coverageScore ?? 100) < 60
  ) {
    return "medium";
  }

  return "low";
}
