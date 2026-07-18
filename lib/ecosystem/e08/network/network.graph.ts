/**
 * E08-P2 — Multi Organization Network Graph
 * Builds DAG edges from organization dependsOn and resolves execution order
 */

import { assertNetworkDefinition } from "./network.registry";
import type {
  NetworkDefinition,
  NetworkEdge,
  NetworkGraph,
  OrganizationNodeDefinition,
} from "./network.types";

export function buildNetworkEdges(
  nodes: OrganizationNodeDefinition[],
): NetworkEdge[] {
  const edges: NetworkEdge[] = [];
  for (const node of nodes) {
    for (const dep of node.dependsOn) {
      edges.push({ from: dep, to: node.id, readOnly: true });
    }
  }
  return edges;
}

export function isNetworkGraphAcyclic(
  nodes: OrganizationNodeDefinition[],
  edges: NetworkEdge[] = buildNetworkEdges(nodes),
): boolean {
  const ids = new Set(nodes.map((n) => n.id));
  const indegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of ids) {
    indegree.set(id, 0);
    adj.set(id, []);
  }

  for (const edge of edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) return false;
    adj.get(edge.from)!.push(edge.to);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  const queue = [...ids].filter((id) => (indegree.get(id) ?? 0) === 0);
  let visited = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    visited += 1;
    for (const next of adj.get(current) ?? []) {
      const nextDegree = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextDegree);
      if (nextDegree === 0) queue.push(next);
    }
  }

  return visited === ids.size;
}

export function resolveNetworkExecutionOrder(
  nodes: OrganizationNodeDefinition[],
  edges: NetworkEdge[] = buildNetworkEdges(nodes),
): string[] {
  if (!isNetworkGraphAcyclic(nodes, edges)) {
    throw new Error("network graph contains a cycle");
  }

  const ids = new Set(nodes.map((n) => n.id));
  const indegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of ids) {
    indegree.set(id, 0);
    adj.set(id, []);
  }

  for (const edge of edges) {
    adj.get(edge.from)!.push(edge.to);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  // Stable Kahn: preserve catalog order among zero-indegree peers
  const catalogOrder = nodes.map((n) => n.id);
  const ready = catalogOrder.filter((id) => (indegree.get(id) ?? 0) === 0);
  const order: string[] = [];

  while (ready.length > 0) {
    const current = ready.shift()!;
    order.push(current);
    for (const next of adj.get(current) ?? []) {
      const nextDegree = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextDegree);
      if (nextDegree === 0) {
        const insertAt = ready.findIndex(
          (id) => catalogOrder.indexOf(id) > catalogOrder.indexOf(next),
        );
        if (insertAt === -1) ready.push(next);
        else ready.splice(insertAt, 0, next);
      }
    }
  }

  return order;
}

export function buildNetworkGraph(network: NetworkDefinition): NetworkGraph {
  assertNetworkDefinition(network);

  const edges = buildNetworkEdges(network.nodes);
  const acyclic = isNetworkGraphAcyclic(network.nodes, edges);
  const order = acyclic
    ? resolveNetworkExecutionOrder(network.nodes, edges)
    : [];

  return {
    networkId: network.id,
    kind: network.kind,
    nodes: network.nodes.map((n) => n.id),
    edges,
    order,
    acyclic,
    readOnly: true,
  };
}
