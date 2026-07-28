/**
 * Product M14 — Intelligence dependency graph registry (in-memory)
 */

import {
  INTELLIGENCE_DEPENDENCY_GRAPH_KINDS,
  INTELLIGENCE_DEPENDENCY_GRAPH_STATUSES,
} from "./dependency.constants";
import type {
  IntelligenceDependencyGraph,
  IntelligenceDependencyGraphKind,
  IntelligenceDependencyGraphStatus,
  RegisterIntelligenceDependencyGraphInput,
  UpdateIntelligenceDependencyGraphStatusInput,
} from "./dependency.types";

const graphs = new Map<string, IntelligenceDependencyGraph>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneGraph(
  graph: IntelligenceDependencyGraph,
): IntelligenceDependencyGraph {
  return { ...graph, metadata: { ...graph.metadata } };
}

export function registerIntelligenceDependencyGraph(
  input: RegisterIntelligenceDependencyGraphInput,
): IntelligenceDependencyGraph {
  const graphKey = input.graphKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!graphKey) throw new Error("graph.graphKey is required");
  if (!title) throw new Error("graph.title is required");
  if (!summary) throw new Error("graph.summary is required");
  if (
    !(INTELLIGENCE_DEPENDENCY_GRAPH_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid graph kind: ${input.kind}`);
  }
  if (keys.has(graphKey)) {
    throw new Error(`graphKey already exists: ${graphKey}`);
  }

  const id = input.id?.trim() || createId("intdep");
  if (graphs.has(id)) throw new Error(`graph already exists: ${id}`);

  const now = nowIso();
  const graph: IntelligenceDependencyGraph = {
    id,
    graphKey,
    kind: input.kind,
    status: INTELLIGENCE_DEPENDENCY_GRAPH_STATUSES[0],
    title,
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  graphs.set(id, graph);
  keys.set(graphKey, id);
  return cloneGraph(graph);
}

export function updateIntelligenceDependencyGraphStatus(
  input: UpdateIntelligenceDependencyGraphStatusInput,
): IntelligenceDependencyGraph {
  const graphId = input.graphId.trim();
  if (!graphId) throw new Error("graph.graphId is required");
  if (
    !(INTELLIGENCE_DEPENDENCY_GRAPH_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid graph status: ${input.status}`);
  }

  const existing = graphs.get(graphId);
  if (!existing) throw new Error(`graph not found: ${graphId}`);

  const updated: IntelligenceDependencyGraph = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  graphs.set(graphId, updated);
  return cloneGraph(updated);
}

export function getIntelligenceDependencyGraph(
  id: string,
): IntelligenceDependencyGraph | undefined {
  const graph = graphs.get(id.trim());
  return graph ? cloneGraph(graph) : undefined;
}

export function listIntelligenceDependencyGraphs(filter?: {
  kind?: IntelligenceDependencyGraphKind;
  status?: IntelligenceDependencyGraphStatus;
}): IntelligenceDependencyGraph[] {
  let result = [...graphs.values()];
  if (filter?.kind) result = result.filter((g) => g.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((g) => g.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.graphKey.localeCompare(b.graphKey))
    .map(cloneGraph);
}

export function clearIntelligenceDependencyGraphs(): void {
  graphs.clear();
  keys.clear();
}
