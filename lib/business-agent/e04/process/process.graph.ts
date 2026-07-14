/**
 * E04-P3 — Process Graph
 * Builds DAG edges from node dependsOn and resolves execution order
 */

import type {
  ProcessDefinition,
  ProcessEdge,
  ProcessGraph,
  ProcessNodeDefinition,
} from "./process.types";

export function buildProcessEdges(
  nodes: ProcessNodeDefinition[],
): ProcessEdge[] {
  const edges: ProcessEdge[] = [];
  for (const node of nodes) {
    for (const dep of node.dependsOn) {
      edges.push({ from: dep, to: node.id, readOnly: true });
    }
  }
  return edges;
}

export function isProcessGraphAcyclic(
  nodes: ProcessNodeDefinition[],
  edges: ProcessEdge[] = buildProcessEdges(nodes),
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

export function resolveProcessExecutionOrder(
  nodes: ProcessNodeDefinition[],
  edges: ProcessEdge[] = buildProcessEdges(nodes),
): string[] {
  if (!isProcessGraphAcyclic(nodes, edges)) {
    throw new Error("process graph contains a cycle");
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
        // insert next respecting remaining catalog relative order
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

export function buildProcessGraph(process: ProcessDefinition): ProcessGraph {
  const edges = buildProcessEdges(process.nodes);
  const acyclic = isProcessGraphAcyclic(process.nodes, edges);
  const order = acyclic
    ? resolveProcessExecutionOrder(process.nodes, edges)
    : [];

  return {
    processId: process.id,
    nodes: process.nodes.map((n) => n.id),
    edges,
    order,
    acyclic,
    readOnly: true,
  };
}
