import type { FederatedPolicyBundle, PolicyFanoutResult } from "./propagation-types";
import type { FederationNode } from "../federation/federation-types";

export function fanoutFederatedPolicies(input: {
  deploymentId: string;
  bundle: FederatedPolicyBundle;
  nodes: FederationNode[];
  syncedDomains: string[];
}): PolicyFanoutResult {
  const fanoutTargets = input.nodes
    .filter((n) => input.syncedDomains.includes(n.domainId) && n.status !== "failed")
    .map((n) => n.nodeId);

  const depth = new Set(input.syncedDomains).size;
  const appliedCount = fanoutTargets.filter((nodeId) => {
    const node = input.nodes.find((n) => n.nodeId === nodeId);
    return node && input.bundle.policies.some((p) => node.capabilities.includes(p));
  }).length;

  return {
    fanoutId: `policy-fanout-${input.deploymentId}`,
    fanoutTargets,
    fanoutDepth: depth,
    appliedCount: appliedCount > 0 ? appliedCount : fanoutTargets.length,
  };
}
