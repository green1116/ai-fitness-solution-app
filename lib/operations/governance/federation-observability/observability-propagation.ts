import type { FederationPropagationObservability } from "./observability-types";
import type { PolicyPropagationRuntimeResult } from "../federation-policy/propagation-types";

export function observeFederationPropagation(input: {
  deploymentId: string;
  policyPropagation: PolicyPropagationRuntimeResult;
}): FederationPropagationObservability {
  const fanout = input.policyPropagation.fanout;
  const fanoutSuccessRate =
    fanout.fanoutTargets.length > 0 ? fanout.appliedCount / fanout.fanoutTargets.length : 1;

  const syncLatencyMs = Math.round((1 - input.policyPropagation.sync.syncRate) * 200);

  return {
    observabilityId: `propagation-observability-${input.deploymentId}`,
    fanoutSuccessRate,
    syncLatencyMs,
    rollbackCount: input.policyPropagation.rollback.rollbackApplied ? 1 : 0,
    freezeCount: input.policyPropagation.freeze.frozenDomains.length,
    conflictCount: input.policyPropagation.conflict.conflicts.length,
  };
}
