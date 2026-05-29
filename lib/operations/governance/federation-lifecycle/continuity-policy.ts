import type { FederationLifecyclePhase, FederationPolicyLifecycleState } from "./continuity-types";
import type { PolicyPropagationRuntimeResult } from "../federation-policy/propagation-types";

export function buildFederationPolicyLifecycle(input: {
  deploymentId: string;
  policyPropagation: PolicyPropagationRuntimeResult;
  globalPhase: FederationLifecyclePhase;
}): FederationPolicyLifecycleState {
  let phase = input.globalPhase;
  if (input.policyPropagation.status === "frozen") phase = "frozen";
  else if (input.policyPropagation.status === "rolled_back") phase = "recovering";
  else if (input.policyPropagation.status === "partial") phase = "degraded";

  return {
    lifecycleId: `policy-lifecycle-${input.deploymentId}`,
    bundleId: input.policyPropagation.bundle.bundleId,
    phase,
    propagationStatus: input.policyPropagation.status,
    version: input.policyPropagation.bundle.version,
  };
}
