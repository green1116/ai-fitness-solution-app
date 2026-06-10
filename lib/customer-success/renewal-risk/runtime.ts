import { finalizeRuntime, runStage } from "../shared/runtime";
import type { CustomerSuccessRuntimeResult, CustomerSuccessStageResult } from "../shared/types";
import { CUSTOMER_SUCCESS_VERSION } from "../shared/types";
import { buildRenewalRiskRecords } from "./builders";
import type { RenewalRiskRuntimePayload } from "./types";
import { RENEWAL_RISK_RUNTIME_VERSION } from "./types";

export function validateRenewalRiskRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const records = buildRenewalRiskRecords(input);
  return { valid: records.length >= 3 && records.some((r) => r.riskLevel === "high") };
}

export function runRenewalRiskRuntime(input?: {
  deploymentId?: string;
}): CustomerSuccessRuntimeResult<RenewalRiskRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "renewal-risk-default";
  const stages: CustomerSuccessStageResult[] = [];

  const records = runStage("renewal-risk-build", "Renewal Risk Records", () => buildRenewalRiskRecords({ deploymentId }), stages);
  const validation = runStage("renewal-risk-validate", "Renewal Risk Validation", () => validateRenewalRiskRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Renewal risk validation failed");

  const payload: RenewalRiskRuntimePayload = {
    version: RENEWAL_RISK_RUNTIME_VERSION,
    successVersion: CUSTOMER_SUCCESS_VERSION,
    records,
    lowRiskCount: records.filter((r) => r.riskLevel === "low").length,
    mediumRiskCount: records.filter((r) => r.riskLevel === "medium").length,
    highRiskCount: records.filter((r) => r.riskLevel === "high").length,
    summary: `renewal-risk low=${records.filter((r) => r.riskLevel === "low").length} medium=${records.filter((r) => r.riskLevel === "medium").length} high=${records.filter((r) => r.riskLevel === "high").length}`,
  };

  return finalizeRuntime({ domain: "renewal-risk", deploymentId, stages, payload, summary: payload.summary });
}
