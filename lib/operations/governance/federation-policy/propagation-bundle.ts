import type { FederatedPolicyBundle } from "./propagation-types";
import type { ConsensusRuntimeResult } from "../federation-consensus/consensus-types";
import type { FederationRuntimeResult } from "../federation/federation-types";
import { resolvePolicyVersionFromConsensus } from "./propagation-registry";

export function buildFederatedPolicyBundle(input: {
  deploymentId: string;
  federation: FederationRuntimeResult;
  consensus: ConsensusRuntimeResult;
  policyPackMode: string;
  requestedPolicyVersion?: string;
}): FederatedPolicyBundle {
  const sourceDomainId = input.federation.policy.sourceDomainId;
  const consensusDecision = input.consensus.resolution.decision;
  const version =
    input.requestedPolicyVersion ?? resolvePolicyVersionFromConsensus(consensusDecision);

  const policies = [
    input.policyPackMode,
    ...input.federation.policy.propagatedPolicies,
    ...input.federation.policy.accepted.map((d) => `domain-policy:${d}`),
  ].filter((p, i, arr) => arr.indexOf(p) === i);

  const executable =
    consensusDecision === "approved" ||
    consensusDecision === "approved_with_restrictions" ||
    consensusDecision === "recovery_required";

  return {
    bundleId: `policy-bundle-${input.deploymentId}`,
    sourceDomainId,
    policies,
    version,
    consensusDecision,
    executable,
  };
}
