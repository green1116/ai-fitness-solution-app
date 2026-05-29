import type { FederationDomain, FederationNode, FederationTopology } from "./federation-types";

export function buildFederationTopology(input: {
  deploymentId: string;
  domains: FederationDomain[];
  nodes: FederationNode[];
}): FederationTopology {
  const edges: FederationTopology["edges"] = [];
  const core = input.domains.find((d) => d.domainType === "core");
  if (core) {
    for (const domain of input.domains) {
      if (domain.domainId === core.domainId) continue;
      edges.push({ from: core.domainId, to: domain.domainId, relation: "routes-to" });
      edges.push({ from: core.domainId, to: domain.domainId, relation: "propagates-to" });
      if (domain.recoveryMode !== "local") {
        edges.push({ from: core.domainId, to: domain.domainId, relation: "recovers-with" });
      }
    }
  }
  return {
    topologyId: `federation-topology-${input.deploymentId}`,
    domains: input.domains,
    nodes: input.nodes,
    edges,
  };
}
