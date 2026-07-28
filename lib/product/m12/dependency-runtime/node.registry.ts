/**
 * Product M12 — Agent dependency node registry (soft catalogKeyRef)
 */

import { AGENT_DEPENDENCY_NODE_STATUSES } from "./dependency.constants";
import { getAgentDependencyGraph } from "./graph.registry";
import type {
  AgentDependencyNode,
  AgentDependencyNodeStatus,
  RegisterAgentDependencyNodeInput,
  UpdateAgentDependencyNodeStatusInput,
} from "./dependency.types";

const nodes = new Map<string, AgentDependencyNode>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneNode(node: AgentDependencyNode): AgentDependencyNode {
  return { ...node, metadata: { ...node.metadata } };
}

export function registerAgentDependencyNode(
  input: RegisterAgentDependencyNodeInput,
): AgentDependencyNode {
  const graphId = input.graphId.trim();
  const nodeKey = input.nodeKey.trim().toUpperCase();
  const catalogKeyRef = input.catalogKeyRef.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!graphId) throw new Error("node.graphId is required");
  if (!nodeKey) throw new Error("node.nodeKey is required");
  if (!catalogKeyRef) throw new Error("node.catalogKeyRef is required");
  if (!summary) throw new Error("node.summary is required");
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error("node.sequence must be a positive integer");
  }

  const graph = getAgentDependencyGraph(graphId);
  if (!graph) throw new Error(`graph not found: ${graphId}`);
  if (graph.status !== "ACTIVE" && graph.status !== "DRAFT") {
    throw new Error(`graph not editable: ${graphId}`);
  }

  const duplicateKey = [...nodes.values()].find(
    (n) => n.graphId === graphId && n.nodeKey === nodeKey,
  );
  if (duplicateKey) throw new Error(`nodeKey already exists: ${nodeKey}`);

  const duplicateSeq = [...nodes.values()].find(
    (n) => n.graphId === graphId && n.sequence === input.sequence,
  );
  if (duplicateSeq) {
    throw new Error(`node sequence already exists: ${input.sequence}`);
  }

  const id = input.id?.trim() || createId("agtdepnode");
  if (nodes.has(id)) throw new Error(`node already exists: ${id}`);

  const now = nowIso();
  const node: AgentDependencyNode = {
    id,
    graphId,
    nodeKey,
    sequence: input.sequence,
    status: AGENT_DEPENDENCY_NODE_STATUSES[0],
    catalogKeyRef,
    summary,
    detail: `seq=${input.sequence} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  nodes.set(id, node);
  return cloneNode(node);
}

export function updateAgentDependencyNodeStatus(
  input: UpdateAgentDependencyNodeStatusInput,
): AgentDependencyNode {
  const nodeId = input.nodeId.trim();
  if (!nodeId) throw new Error("node.nodeId is required");
  if (
    !(AGENT_DEPENDENCY_NODE_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid node status: ${input.status}`);
  }

  const existing = nodes.get(nodeId);
  if (!existing) throw new Error(`node not found: ${nodeId}`);

  const updated: AgentDependencyNode = {
    ...existing,
    status: input.status,
    detail: `seq=${existing.sequence} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  nodes.set(nodeId, updated);
  return cloneNode(updated);
}

export function getAgentDependencyNode(
  id: string,
): AgentDependencyNode | undefined {
  const node = nodes.get(id.trim());
  return node ? cloneNode(node) : undefined;
}

export function listAgentDependencyNodes(filter?: {
  graphId?: string;
  status?: AgentDependencyNodeStatus;
}): AgentDependencyNode[] {
  let result = [...nodes.values()];
  if (filter?.graphId) {
    const graphId = filter.graphId.trim();
    result = result.filter((n) => n.graphId === graphId);
  }
  if (filter?.status) {
    result = result.filter((n) => n.status === filter.status);
  }
  return result
    .slice()
    .sort(
      (a, b) =>
        a.sequence - b.sequence || a.nodeKey.localeCompare(b.nodeKey),
    )
    .map(cloneNode);
}

export function clearAgentDependencyNodes(): void {
  nodes.clear();
}
