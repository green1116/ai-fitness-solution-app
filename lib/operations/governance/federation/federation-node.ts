import type { FederationDomain, FederationNode } from "./federation-types";

export function buildFederationNodes(
  domains: FederationDomain[],
  deploymentId: string,
): FederationNode[] {
  const nodes: FederationNode[] = [];
  for (const domain of domains) {
    for (const nodeId of domain.activeNodes) {
      nodes.push({
        nodeId,
        domainId: domain.domainId,
        runtimeId: `runtime-${deploymentId}-${nodeId}`,
        status: domain.trustLevel === "restricted" ? "degraded" : "healthy",
        capabilities: domain.supportedPolicies,
      });
    }
  }
  return nodes;
}
