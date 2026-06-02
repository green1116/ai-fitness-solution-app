import type {
  ExecutiveInputsSnapshot,
  ExecutiveKeyMetrics,
  ExecutiveOversightRuntimeInput,
  ExecutiveRiskLevel,
} from "../types";

export function buildExecutiveInputsSnapshot(
  input: ExecutiveOversightRuntimeInput,
): ExecutiveInputsSnapshot {
  const gov = input.tenderGovernance;
  const dec = input.tenderDecision;
  const val = input.tenderValidation;

  return {
    decisionStatus: dec?.status,
    validationOutcome: val?.outcome,
    governanceRisk: gov?.riskLevel,
    governancePosture: gov?.posture,
    escalationRequired: gov?.escalation.required,
    escalationLevel: gov?.escalation.level,
  };
}

export function buildExecutiveKeyMetrics(
  input: ExecutiveOversightRuntimeInput,
): ExecutiveKeyMetrics {
  const cov = input.coverageRuntime;
  const dec = input.tenderDecision;
  const gov = input.tenderGovernance;
  const audit = input.tenderAudit;

  return {
    coverageScore: cov?.summary.validationScore,
    coverageRatio: cov?.summary.coverageRatio,
    decisionConfidence: dec?.confidence,
    validationOutcome: input.tenderValidation?.outcome,
    governanceRisk: gov?.riskLevel,
    governancePosture: gov?.posture,
    auditEntries: audit?.trail.summary.totalEntries,
    controlsPassed: gov?.oversight.controlsPassed,
    controlsFailed: gov?.oversight.controlsFailed,
  };
}

/**
 * 高管风险等级（确定性，基于 Governance → Decision 栈）
 */
export function assessExecutiveRiskLevel(
  inputs: ExecutiveInputsSnapshot,
): ExecutiveRiskLevel {
  if (
    inputs.governancePosture === "halt" ||
    inputs.governanceRisk === "critical" ||
    inputs.decisionStatus === "rejected" ||
    inputs.validationOutcome === "rejected"
  ) {
    return "critical";
  }

  if (
    inputs.governanceRisk === "high" ||
    inputs.governancePosture === "hold" ||
    inputs.decisionStatus === "high-risk"
  ) {
    return "high";
  }

  if (
    inputs.governancePosture === "escalate" ||
    inputs.governanceRisk === "medium" ||
    inputs.decisionStatus === "conditional" ||
    inputs.validationOutcome === "conditional" ||
    inputs.escalationRequired
  ) {
    return "attention";
  }

  return "acceptable";
}
