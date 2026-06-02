import type {
  GovernanceCapabilityDependencyEdge,
  GovernanceCapabilityDependencyGraph,
} from "./baseline-types";
import { GOVERNANCE_PLATFORM_CAPABILITY_CATALOG } from "./baseline-registry";

function relationForEdge(
  fromTier: string,
  toTier: string,
): GovernanceCapabilityDependencyEdge["relation"] {
  if (fromTier === "observability" || fromTier === "intelligence") return "observes";
  if (fromTier === "meta" || fromTier === "optimization") return "extends";
  return "requires";
}

export function buildGovernanceCapabilityDependencyGraph(input: {
  deploymentId: string;
}): GovernanceCapabilityDependencyGraph {
  const catalogById = new Map(
    GOVERNANCE_PLATFORM_CAPABILITY_CATALOG.map((entry) => [entry.capabilityId, entry]),
  );
  const edges: GovernanceCapabilityDependencyEdge[] = [];

  for (const catalog of GOVERNANCE_PLATFORM_CAPABILITY_CATALOG) {
    for (const dependencyId of catalog.dependsOn) {
      const dependency = catalogById.get(dependencyId);
      edges.push({
        edgeId: `dependency-${dependencyId}-to-${catalog.capabilityId}`,
        fromCapabilityId: dependencyId,
        toCapabilityId: catalog.capabilityId,
        relation: relationForEdge(dependency?.tier ?? "core", catalog.tier),
      });
    }
  }

  return {
    graphId: `capability-dependency-graph-${input.deploymentId}`,
    nodes: GOVERNANCE_PLATFORM_CAPABILITY_CATALOG.map((entry) => entry.capabilityId),
    edges,
  };
}

export function computeDependencyDepth(graph: GovernanceCapabilityDependencyGraph): number {
  const incoming = new Map<string, number>();
  for (const node of graph.nodes) incoming.set(node, 0);
  for (const edge of graph.edges) {
    incoming.set(edge.toCapabilityId, (incoming.get(edge.toCapabilityId) ?? 0) + 1);
  }
  let depth = 0;
  let frontier = graph.nodes.filter((node) => (incoming.get(node) ?? 0) === 0);
  while (frontier.length > 0) {
    depth += 1;
    const next: string[] = [];
    for (const node of frontier) {
      for (const edge of graph.edges) {
        if (edge.fromCapabilityId !== node) continue;
        const count = (incoming.get(edge.toCapabilityId) ?? 0) - 1;
        incoming.set(edge.toCapabilityId, count);
        if (count === 0) next.push(edge.toCapabilityId);
      }
    }
    frontier = next;
  }
  return depth;
}
