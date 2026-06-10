import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevOpsRuntimeResult, RevOpsStageResult } from "../shared/types";
import { REVENUE_OPERATIONS_VERSION } from "../shared/types";
import { buildRenewalRecords, summarizeRenewals } from "./builders";
import type { RenewalRuntimePayload } from "./types";
import { RENEWAL_RUNTIME_VERSION } from "./types";

export function validateRenewalRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const records = buildRenewalRecords(input);
  const summary = summarizeRenewals(records);
  return { valid: records.length >= 3 && summary.renewalReadiness > 0 };
}

export function runRenewalRuntime(input?: { deploymentId?: string }): RevOpsRuntimeResult<RenewalRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "renewal-default";
  const stages: RevOpsStageResult[] = [];

  const records = runStage("renewal-build", "Renewal Records", () => buildRenewalRecords({ deploymentId }), stages);
  const summary = runStage("renewal-summarize", "Renewal Summary", () => summarizeRenewals(records), stages);
  const validation = runStage("renewal-validate", "Renewal Validation", () => validateRenewalRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Renewal runtime validation failed");

  const payload: RenewalRuntimePayload = {
    version: RENEWAL_RUNTIME_VERSION,
    revOpsVersion: REVENUE_OPERATIONS_VERSION,
    records,
    ...summary,
    summary: `renewal-runtime upcoming=${summary.upcomingRenewals} completed=${summary.completedRenewals} rate=${(summary.renewalRate * 100).toFixed(0)}% risk=${summary.renewalRisk}`,
  };

  return finalizeRuntime({ domain: "renewal-runtime", deploymentId, stages, payload, summary: payload.summary });
}
