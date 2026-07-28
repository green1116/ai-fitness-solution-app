/**
 * Product M13 — OS dependency edge registry (directed, acyclic)
 */

import {
  OS_DEPENDENCY_EDGE_STATUSES,
  OS_DEPENDENCY_IMPACTS,
} from "./dependency.constants";
import { getOsDependencyGraph } from "./graph.registry";
import { getOsDependencyNode } from "./node.registry";
import type {
  BindOsDependencyEdgeInput,
  OsDependencyEdge,
  OsDependencyEdgeStatus,
} from "./dependency.types";

const edges = new Map<string, OsDependencyEdge>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEdge(edge: OsDependencyEdge): OsDependencyEdge {
  return { ...edge, metadata: { ...edge.metadata } };
}

function wouldCreateCycle(
  graphId: string,
  upstreamNodeId: string,
  downstreamNodeId: string,
): boolean {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges.values()) {
    if (edge.graphId !== graphId || edge.status === "REVOKED") continue;
    const list = adjacency.get(edge.upstreamNodeId) ?? [];
    list.push(edge.downstreamNodeId);
    adjacency.set(edge.upstreamNodeId, list);
  }
  const provisional = adjacency.get(upstreamNodeId) ?? [];
  provisional.push(downstreamNodeId);
  adjacency.set(upstreamNodeId, provisional);

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visiting.add(nodeId);
    for (const next of adjacency.get(nodeId) ?? []) {
      if (dfs(next)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  for (const nodeId of adjacency.keys()) {
    if (dfs(nodeId)) return true;
  }
  return false;
}

export function isOsDependencyGraphAcyclic(graphId?: string): boolean {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges.values()) {
    if (graphId && edge.graphId !== graphId) continue;
    if (edge.status === "REVOKED") continue;
    const list = adjacency.get(edge.upstreamNodeId) ?? [];
    list.push(edge.downstreamNodeId);
    adjacency.set(edge.upstreamNodeId, list);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visiting.add(nodeId);
    for (const next of adjacency.get(nodeId) ?? []) {
      if (dfs(next)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  for (const nodeId of adjacency.keys()) {
    if (dfs(nodeId)) return false;
  }
  return true;
}

export function bindOsDependencyEdge(
  input: BindOsDependencyEdgeInput,
): OsDependencyEdge {
  const graphId = input.graphId.trim();
  const edgeKey = input.edgeKey.trim().toUpperCase();
  const upstreamNodeId = input.upstreamNodeId.trim();
  const downstreamNodeId = input.downstreamNodeId.trim();
  if (!graphId) throw new Error("edge.graphId is required");
  if (!edgeKey) throw new Error("edge.edgeKey is required");
  if (!upstreamNodeId) throw new Error("edge.upstreamNodeId is required");
  if (!downstreamNodeId) throw new Error("edge.downstreamNodeId is required");
  if (upstreamNodeId === downstreamNodeId) {
    throw new Error("edge cannot be self-referential");
  }
  if (!(OS_DEPENDENCY_IMPACTS as readonly string[]).includes(input.impact)) {
    throw new Error(`invalid edge impact: ${input.impact}`);
  }

  const graph = getOsDependencyGraph(graphId);
  if (!graph) throw new Error(`graph not found: ${graphId}`);
  if (graph.status !== "ACTIVE") {
    throw new Error(`graph not active: ${graphId}`);
  }

  const upstream = getOsDependencyNode(upstreamNodeId);
  if (!upstream) throw new Error(`upstream node not found: ${upstreamNodeId}`);
  if (upstream.graphId !== graphId) {
    throw new Error(`upstream node graph mismatch: ${upstreamNodeId}`);
  }
  if (upstream.status !== "DECLARED") {
    throw new Error(`upstream node not declared: ${upstreamNodeId}`);
  }

  const downstream = getOsDependencyNode(downstreamNodeId);
  if (!downstream) {
    throw new Error(`downstream node not found: ${downstreamNodeId}`);
  }
  if (downstream.graphId !== graphId) {
    throw new Error(`downstream node graph mismatch: ${downstreamNodeId}`);
  }
  if (downstream.status !== "DECLARED") {
    throw new Error(`downstream node not declared: ${downstreamNodeId}`);
  }

  const duplicate = [...edges.values()].find(
    (e) => e.graphId === graphId && e.edgeKey === edgeKey,
  );
  if (duplicate) throw new Error(`edgeKey already exists: ${edgeKey}`);

  if (wouldCreateCycle(graphId, upstreamNodeId, downstreamNodeId)) {
    throw new Error("edge would create a dependency cycle");
  }

  const id = input.id?.trim() || createId("osdepedge");
  if (edges.has(id)) throw new Error(`edge already exists: ${id}`);

  const now = nowIso();
  const edge: OsDependencyEdge = {
    id,
    graphId,
    edgeKey,
    upstreamNodeId,
    downstreamNodeId,
    impact: input.impact,
    required: input.required ?? true,
    status: OS_DEPENDENCY_EDGE_STATUSES[0],
    detail: `impact=${input.impact} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  edges.set(id, edge);
  return cloneEdge(edge);
}

export function getOsDependencyEdge(id: string): OsDependencyEdge | undefined {
  const edge = edges.get(id.trim());
  return edge ? cloneEdge(edge) : undefined;
}

export function listOsDependencyEdges(filter?: {
  graphId?: string;
  status?: OsDependencyEdgeStatus;
}): OsDependencyEdge[] {
  let result = [...edges.values()];
  if (filter?.graphId) {
    const graphId = filter.graphId.trim();
    result = result.filter((e) => e.graphId === graphId);
  }
  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.edgeKey.localeCompare(b.edgeKey))
    .map(cloneEdge);
}

export function clearOsDependencyEdges(): void {
  edges.clear();
}
