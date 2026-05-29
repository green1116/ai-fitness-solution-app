import type { PolicyVersionPropagation } from "./propagation-types";

export function propagatePolicyVersion(input: {
  deploymentId: string;
  sourceVersion: string;
  targetVersion: string;
  syncedDomains: string[];
}): PolicyVersionPropagation {
  return {
    propagationId: `policy-version-${input.deploymentId}`,
    sourceVersion: input.sourceVersion,
    targetVersion: input.targetVersion,
    propagatedDomains: input.syncedDomains,
  };
}
