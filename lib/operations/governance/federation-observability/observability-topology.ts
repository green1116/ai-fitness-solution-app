import type { FederationTopologyObservability } from "./observability-types";
import type { FederationRuntimeResult } from "../federation/federation-types";
import { clampScore } from "./observability-registry";

export function observeFederationTopology(input: {
  deploymentId: string;
  federation: FederationRuntimeResult;
}): FederationTopologyObservability {
  const degradedRoutes =
    input.federation.routing.status === "degraded" || input.federation.routing.status === "failed"
      ? 1
      : 0;
  const nodeHealth =
    input.federation.topology.nodes.filter((n) => n.status === "healthy").length /
    Math.max(input.federation.topology.nodes.length, 1);

  const topologyHealthScore = clampScore(
    100 - degradedRoutes * 25 - (1 - nodeHealth) * 30,
  );

  return {
    observabilityId: `topology-observability-${input.deploymentId}`,
    domainCount: input.federation.topology.domains.length,
    nodeCount: input.federation.topology.nodes.length,
    edgeCount: input.federation.topology.edges.length,
    topologyHealthScore,
    degradedRoutes,
  };
}
