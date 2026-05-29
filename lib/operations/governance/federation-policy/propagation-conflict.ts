import type { FederatedPolicyBundle, PolicyConflictArbitration, PolicyConflictResolution } from "./propagation-types";
import type { FederationPolicyPropagation } from "../federation/federation-types";

export function arbitratePolicyConflicts(input: {
  deploymentId: string;
  bundle: FederatedPolicyBundle;
  federationPolicy: FederationPolicyPropagation;
  boundaryViolations: string[];
}): PolicyConflictArbitration {
  const conflicts: string[] = [];

  for (const rejected of input.federationPolicy.rejected) {
    if (input.bundle.policies.some((p) => p !== rejected)) {
      conflicts.push(`domain-rejected:${rejected}`);
    }
  }
  for (const violation of input.boundaryViolations) {
    conflicts.push(`boundary:${violation}`);
  }
  if (input.federationPolicy.accepted.length !== input.federationPolicy.targetDomainIds.length) {
    conflicts.push("partial-acceptance");
  }

  let resolution: PolicyConflictResolution = "source_wins";
  if (conflicts.length === 0) {
    resolution = "merge";
  } else if (input.bundle.consensusDecision === "approved_with_restrictions") {
    resolution = "defer";
  } else if (input.federationPolicy.rejected.length > input.federationPolicy.accepted.length) {
    resolution = "target_wins";
  }

  const arbitratedPolicies =
    resolution === "target_wins"
      ? input.federationPolicy.propagatedPolicies.filter((p) => p !== "strict")
      : input.bundle.policies;

  return {
    arbitrationId: `policy-conflict-${input.deploymentId}`,
    conflicts,
    resolution,
    arbitratedPolicies: [...new Set(arbitratedPolicies)],
  };
}
