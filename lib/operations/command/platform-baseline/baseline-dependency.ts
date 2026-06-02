import type {
  CommandCapabilityDependencyEdge,
  CommandCapabilityDependencyGraph,
} from "./baseline-types";
import { COMMAND_PLATFORM_CAPABILITY_CATALOG } from "./baseline-registry";

function relationForEdge(
  fromTier: string,
  toTier: string,
): CommandCapabilityDependencyEdge["relation"] {
  if (toTier === "coordination" || toTier === "orchestration") return "gates";
  if (fromTier === "orchestration") return "extends";
  return "requires";
}

export function buildCommandCapabilityDependencyGraph(input: {
  deploymentId: string;
}): CommandCapabilityDependencyGraph {
  const catalogById = new Map(
    COMMAND_PLATFORM_CAPABILITY_CATALOG.map((entry) => [entry.capabilityId, entry]),
  );
  const edges: CommandCapabilityDependencyEdge[] = [];

  for (const catalog of COMMAND_PLATFORM_CAPABILITY_CATALOG) {
    for (const dependencyId of catalog.dependsOn) {
      const dependency = catalogById.get(dependencyId);
      edges.push({
        edgeId: `command-dependency-${dependencyId}-to-${catalog.capabilityId}`,
        fromCapabilityId: dependencyId,
        toCapabilityId: catalog.capabilityId,
        relation: relationForEdge(dependency?.tier ?? "foundation", catalog.tier),
      });
    }
  }

  return {
    graphId: `command-capability-dependency-graph-${input.deploymentId}`,
    nodes: COMMAND_PLATFORM_CAPABILITY_CATALOG.map((entry) => entry.capabilityId),
    edges,
  };
}

export function computeCommandDependencyDepth(graph: CommandCapabilityDependencyGraph): number {
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
