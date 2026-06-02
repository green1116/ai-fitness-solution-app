import type { PolicyFreezePropagation } from "./propagation-types";
import type { FederationRuntimeResult } from "../federation/federation-types";

export function propagatePolicyFreeze(input: {
  deploymentId: string;
  federation: FederationRuntimeResult;
  syncRate: number;
  boundaryViolations: string[];
  rollbackApplied: boolean;
}): PolicyFreezePropagation {
  const partialAvailability =
    input.syncRate > 0 && input.syncRate < 1 && !input.rollbackApplied;

  const frozenDomains: string[] = [];
  if (input.federation.routing.status === "failed" || input.federation.routing.status === "isolated") {
    frozenDomains.push(input.federation.routing.targetDomainId);
  }
  for (const violation of input.boundaryViolations) {
    const domainId = violation.split(":")[0];
    if (domainId.startsWith("domain-") && !frozenDomains.includes(domainId)) {
      frozenDomains.push(domainId);
    }
  }

  let freezeReason = "none";
  if (input.rollbackApplied) freezeReason = "rollback-active";
  else if (partialAvailability) freezeReason = "partial-sync-freeze";
  else if (frozenDomains.length > 0) freezeReason = "boundary-violation-freeze";

  return {
    freezeId: `policy-freeze-${input.deploymentId}`,
    frozenDomains,
    freezeReason,
    partialAvailability,
  };
}
