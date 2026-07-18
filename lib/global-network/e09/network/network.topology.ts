/**
 * E09-P1 — Network Topology
 * Builds topology views and connectivity analysis over a NetworkGraph
 */

import type { GlobalEdgeRelation, NetworkEdge } from "../core/global.types";
import type { NetworkGraph } from "./network.graph";
import type { GlobalNetworkNode } from "./network.node";

export type NetworkTopology = {
  nodeIds: string[];
  edgeKeys: string[];
  adjacency: Readonly<Record<string, string[]>>;
  reverseAdjacency: Readonly<Record<string, string[]>>;
  nodeCount: number;
  edgeCount: number;
};

export type ConnectivityAnalysis = {
  connected: boolean;
  componentCount: number;
  components: string[][];
  isolatedNodes: string[];
  averageDegree: number;
  maxDegree: number;
  densestRelation?: GlobalEdgeRelation;
  summary: string;
};

export type NetworkMapEntry = {
  node: GlobalNetworkNode;
  outbound: NetworkEdge[];
  inbound: NetworkEdge[];
  neighborIds: string[];
};

export type NetworkMap = {
  entries: NetworkMapEntry[];
  nodeCount: number;
  edgeCount: number;
  byType: Readonly<Record<string, string[]>>;
  summary: string;
};

function edgeKey(edge: NetworkEdge): string {
  return `${edge.source}->${edge.target}:${edge.relation}`;
}

function undirectedComponents(
  nodeIds: string[],
  edges: NetworkEdge[],
): string[][] {
  const adj = new Map<string, Set<string>>();
  for (const id of nodeIds) {
    adj.set(id, new Set());
  }
  for (const edge of edges) {
    adj.get(edge.source)?.add(edge.target);
    adj.get(edge.target)?.add(edge.source);
  }

  const visited = new Set<string>();
  const components: string[][] = [];

  for (const id of nodeIds) {
    if (visited.has(id)) continue;
    const stack = [id];
    const component: string[] = [];
    visited.add(id);

    while (stack.length > 0) {
      const current = stack.pop()!;
      component.push(current);
      for (const next of adj.get(current) ?? []) {
        if (!visited.has(next)) {
          visited.add(next);
          stack.push(next);
        }
      }
    }

    components.push(component.sort());
  }

  return components;
}

/** Build directed adjacency topology from the live graph. */
export function buildTopology(graph: NetworkGraph): NetworkTopology {
  const nodes = graph.listNodes();
  const edges = graph.getEdges();
  const nodeIds = nodes.map((n) => n.id).sort();

  const adjacency: Record<string, string[]> = {};
  const reverseAdjacency: Record<string, string[]> = {};
  for (const id of nodeIds) {
    adjacency[id] = [];
    reverseAdjacency[id] = [];
  }

  for (const edge of edges) {
    adjacency[edge.source]?.push(edge.target);
    reverseAdjacency[edge.target]?.push(edge.source);
  }

  for (const id of nodeIds) {
    adjacency[id] = [...new Set(adjacency[id])].sort();
    reverseAdjacency[id] = [...new Set(reverseAdjacency[id])].sort();
  }

  return {
    nodeIds,
    edgeKeys: edges.map(edgeKey).sort(),
    adjacency,
    reverseAdjacency,
    nodeCount: nodeIds.length,
    edgeCount: edges.length,
  };
}

/** Analyze undirected connectivity and basic degree metrics. */
export function analyzeConnectivity(graph: NetworkGraph): ConnectivityAnalysis {
  const nodes = graph.listNodes();
  const edges = graph.getEdges();
  const nodeIds = nodes.map((n) => n.id);
  const components = undirectedComponents(nodeIds, edges);

  const degree = new Map<string, number>();
  for (const id of nodeIds) degree.set(id, 0);
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }

  const degrees = [...degree.values()];
  const averageDegree =
    degrees.length === 0
      ? 0
      : Math.round(
          (degrees.reduce((sum, d) => sum + d, 0) / degrees.length) * 100,
        ) / 100;
  const maxDegree = degrees.length === 0 ? 0 : Math.max(...degrees);
  const isolatedNodes = nodeIds
    .filter((id) => (degree.get(id) ?? 0) === 0)
    .sort();

  const relationCounts = new Map<GlobalEdgeRelation, number>();
  for (const edge of edges) {
    relationCounts.set(
      edge.relation,
      (relationCounts.get(edge.relation) ?? 0) + 1,
    );
  }
  let densestRelation: GlobalEdgeRelation | undefined;
  let densestCount = -1;
  for (const [relation, count] of relationCounts) {
    if (count > densestCount) {
      densestCount = count;
      densestRelation = relation;
    }
  }

  const componentCount = components.length;
  // Empty / single-node graphs are connected; multi-component is not.
  const isConnected = nodeIds.length <= 1 ? true : componentCount === 1;

  return {
    connected: isConnected,
    componentCount: nodeIds.length === 0 ? 0 : componentCount,
    components,
    isolatedNodes,
    averageDegree,
    maxDegree,
    densestRelation,
    summary: [
      `connectivity connected=${isConnected}`,
      `components=${nodeIds.length === 0 ? 0 : componentCount}`,
      `isolated=${isolatedNodes.length}`,
      `avgDegree=${averageDegree}`,
      `maxDegree=${maxDegree}`,
      densestRelation ? `densest=${densestRelation}` : "densest=none",
    ].join(" "),
  };
}

/** Materialize a per-node network map (outbound/inbound/neighbors). */
export function getNetworkMap(graph: NetworkGraph): NetworkMap {
  const nodes = graph.listNodes();
  const edges = graph.getEdges();

  const byType: Record<string, string[]> = {};
  const entries: NetworkMapEntry[] = nodes
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((node) => {
      const outbound = edges.filter((e) => e.source === node.id);
      const inbound = edges.filter((e) => e.target === node.id);
      const neighborIds = [
        ...new Set([
          ...outbound.map((e) => e.target),
          ...inbound.map((e) => e.source),
        ]),
      ].sort();

      byType[node.type] = [...(byType[node.type] ?? []), node.id];

      return {
        node,
        outbound,
        inbound,
        neighborIds,
      };
    });

  for (const type of Object.keys(byType)) {
    byType[type] = [...byType[type]].sort();
  }

  return {
    entries,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    byType,
    summary: [
      `network-map nodes=${nodes.length}`,
      `edges=${edges.length}`,
      `types=${Object.keys(byType).length}`,
    ].join(" "),
  };
}
