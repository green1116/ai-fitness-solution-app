/**
 * E02-P1 — Tender Knowledge Graph schema (pure TS validation)
 */

import type {
  KnowledgeEdge,
  KnowledgeEdgeKind,
  KnowledgeGraph,
  KnowledgeGraphStatus,
  KnowledgeKernelInput,
  KnowledgeLifecycleStage,
  KnowledgeNode,
  KnowledgeNodeKind,
} from "./knowledge.types";

export const KNOWLEDGE_NODE_KINDS: readonly KnowledgeNodeKind[] = [
  "project",
  "organization",
  "requirement",
  "equipment",
  "clause",
  "standard",
  "budget",
  "deliverable",
  "location",
  "other",
] as const;

export const KNOWLEDGE_EDGE_KINDS: readonly KnowledgeEdgeKind[] = [
  "belongs_to",
  "requires",
  "references",
  "constrains",
  "supplies",
  "located_in",
  "owns",
  "related_to",
] as const;

export const KNOWLEDGE_GRAPH_STATUSES: readonly KnowledgeGraphStatus[] = [
  "pending",
  "drafted",
  "ready",
  "failed",
] as const;

export const KNOWLEDGE_LIFECYCLE_STAGES: readonly KnowledgeLifecycleStage[] = [
  "node",
  "edge",
  "graph",
] as const;

export type SchemaIssue = {
  path: string;
  message: string;
};

export type SchemaResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: SchemaIssue[] };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function issue(path: string, message: string): SchemaIssue {
  return { path, message };
}

export function validateKnowledgeNode(node: unknown): SchemaResult<KnowledgeNode> {
  const issues: SchemaIssue[] = [];
  if (!node || typeof node !== "object") {
    return { ok: false, issues: [issue("node", "node is required")] };
  }

  const n = node as Partial<KnowledgeNode>;
  if (!isNonEmptyString(n.id)) issues.push(issue("node.id", "id is required"));
  if (!isNonEmptyString(n.label)) issues.push(issue("node.label", "label is required"));
  if (
    typeof n.kind !== "string" ||
    !(KNOWLEDGE_NODE_KINDS as readonly string[]).includes(n.kind)
  ) {
    issues.push(issue("node.kind", `kind must be one of: ${KNOWLEDGE_NODE_KINDS.join(", ")}`));
  }
  if (!Array.isArray(n.aliases)) {
    issues.push(issue("node.aliases", "aliases must be an array"));
  }
  if (typeof n.confidence !== "number" || n.confidence < 0 || n.confidence > 1) {
    issues.push(issue("node.confidence", "confidence must be between 0 and 1"));
  }
  if (n.readOnly !== true) issues.push(issue("node.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: node as KnowledgeNode };
}

export function validateKnowledgeEdge(
  edge: unknown,
  nodeIds?: Set<string>,
): SchemaResult<KnowledgeEdge> {
  const issues: SchemaIssue[] = [];
  if (!edge || typeof edge !== "object") {
    return { ok: false, issues: [issue("edge", "edge is required")] };
  }

  const e = edge as Partial<KnowledgeEdge>;
  if (!isNonEmptyString(e.id)) issues.push(issue("edge.id", "id is required"));
  if (!isNonEmptyString(e.fromNodeId)) {
    issues.push(issue("edge.fromNodeId", "fromNodeId is required"));
  }
  if (!isNonEmptyString(e.toNodeId)) {
    issues.push(issue("edge.toNodeId", "toNodeId is required"));
  }
  if (!isNonEmptyString(e.label)) issues.push(issue("edge.label", "label is required"));
  if (
    typeof e.kind !== "string" ||
    !(KNOWLEDGE_EDGE_KINDS as readonly string[]).includes(e.kind)
  ) {
    issues.push(issue("edge.kind", `kind must be one of: ${KNOWLEDGE_EDGE_KINDS.join(", ")}`));
  }
  if (typeof e.weight !== "number" || e.weight < 0) {
    issues.push(issue("edge.weight", "weight must be a non-negative number"));
  }
  if (e.readOnly !== true) issues.push(issue("edge.readOnly", "readOnly must be true"));

  if (nodeIds) {
    if (isNonEmptyString(e.fromNodeId) && !nodeIds.has(e.fromNodeId)) {
      issues.push(issue("edge.fromNodeId", "fromNodeId must reference an existing node"));
    }
    if (isNonEmptyString(e.toNodeId) && !nodeIds.has(e.toNodeId)) {
      issues.push(issue("edge.toNodeId", "toNodeId must reference an existing node"));
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: edge as KnowledgeEdge };
}

export function validateKnowledgeGraph(graph: unknown): SchemaResult<KnowledgeGraph> {
  const issues: SchemaIssue[] = [];
  if (!graph || typeof graph !== "object") {
    return { ok: false, issues: [issue("graph", "graph is required")] };
  }

  const g = graph as Partial<KnowledgeGraph>;
  if (!isNonEmptyString(g.id)) issues.push(issue("graph.id", "id is required"));
  if (!isNonEmptyString(g.title)) issues.push(issue("graph.title", "title is required"));
  if (
    typeof g.status !== "string" ||
    !(KNOWLEDGE_GRAPH_STATUSES as readonly string[]).includes(g.status)
  ) {
    issues.push(
      issue("graph.status", `status must be one of: ${KNOWLEDGE_GRAPH_STATUSES.join(", ")}`),
    );
  }
  if (!Array.isArray(g.nodes) || g.nodes.length < 1) {
    issues.push(issue("graph.nodes", "nodes must be non-empty"));
  }
  if (!Array.isArray(g.edges)) {
    issues.push(issue("graph.edges", "edges must be an array"));
  }
  if (typeof g.nodeCount === "number" && Array.isArray(g.nodes) && g.nodeCount !== g.nodes.length) {
    issues.push(issue("graph.nodeCount", "nodeCount must match nodes.length"));
  }
  if (typeof g.edgeCount === "number" && Array.isArray(g.edges) && g.edgeCount !== g.edges.length) {
    issues.push(issue("graph.edgeCount", "edgeCount must match edges.length"));
  }
  if (g.readOnly !== true) issues.push(issue("graph.readOnly", "readOnly must be true"));

  if (Array.isArray(g.nodes) && Array.isArray(g.edges)) {
    const nodeIds = new Set(
      g.nodes
        .filter((n): n is KnowledgeNode => Boolean(n && typeof n === "object"))
        .map((n) => n.id),
    );
    for (let i = 0; i < g.nodes.length; i++) {
      const result = validateKnowledgeNode(g.nodes[i]);
      if (!result.ok) {
        issues.push(
          ...result.issues.map((it) => issue(`graph.nodes[${i}].${it.path}`, it.message)),
        );
      }
    }
    for (let i = 0; i < g.edges.length; i++) {
      const result = validateKnowledgeEdge(g.edges[i], nodeIds);
      if (!result.ok) {
        issues.push(
          ...result.issues.map((it) => issue(`graph.edges[${i}].${it.path}`, it.message)),
        );
      }
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: graph as KnowledgeGraph };
}

export function validateKnowledgeKernelInput(
  input: unknown,
): SchemaResult<KnowledgeKernelInput> {
  const issues: SchemaIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, issues: [issue("input", "input is required")] };
  }

  const i = input as Partial<KnowledgeKernelInput>;
  const hasText = isNonEmptyString(i.rawText) && i.rawText.trim().length >= 20;
  const hasSeeds = Array.isArray(i.seedNodes) && i.seedNodes.length > 0;
  const hasHints =
    isNonEmptyString(i.projectHint) || isNonEmptyString(i.organizationHint);

  if (!hasText && !hasSeeds && !hasHints) {
    issues.push(
      issue(
        "input",
        "rawText (>=20 chars), seedNodes, or project/organization hint is required",
      ),
    );
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: input as KnowledgeKernelInput };
}

export function assertValidKnowledgeGraph(graph: KnowledgeGraph): void {
  const result = validateKnowledgeGraph(graph);
  if (!result.ok) {
    throw new Error(
      `Invalid KnowledgeGraph: ${result.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
}
