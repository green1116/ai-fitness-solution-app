/**
 * E02-P4 — Knowledge Retrieval schema (pure TS validation)
 */

import { KNOWLEDGE_EDGE_KINDS, KNOWLEDGE_NODE_KINDS } from "../knowledge/knowledge.schema";
import type { KnowledgeGraph } from "../knowledge/knowledge.types";
import type {
  KnowledgeContext,
  KnowledgeContextStatus,
  KnowledgeHit,
  KnowledgeQuery,
  RetrievalKernelInput,
  RetrievalLifecycleStage,
} from "./retrieval.types";

export const RETRIEVAL_LIFECYCLE_STAGES: readonly RetrievalLifecycleStage[] = [
  "graph",
  "query",
  "context",
] as const;

export const KNOWLEDGE_CONTEXT_STATUSES: readonly KnowledgeContextStatus[] = [
  "pending",
  "ranked",
  "ready",
  "failed",
] as const;

export { KNOWLEDGE_NODE_KINDS, KNOWLEDGE_EDGE_KINDS };

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

export function validateKnowledgeGraphInput(
  graph: unknown,
): SchemaResult<KnowledgeGraph> {
  const issues: SchemaIssue[] = [];
  if (!graph || typeof graph !== "object") {
    return { ok: false, issues: [issue("graph", "graph is required")] };
  }

  const g = graph as Partial<KnowledgeGraph>;
  if (!isNonEmptyString(g.id)) issues.push(issue("graph.id", "id is required"));
  if (!Array.isArray(g.nodes) || g.nodes.length < 1) {
    issues.push(issue("graph.nodes", "nodes must be non-empty"));
  }
  if (!Array.isArray(g.edges)) {
    issues.push(issue("graph.edges", "edges must be an array"));
  }
  if (g.readOnly !== true) {
    issues.push(issue("graph.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: graph as KnowledgeGraph };
}

export function validateKnowledgeQuery(query: unknown): SchemaResult<KnowledgeQuery> {
  const issues: SchemaIssue[] = [];
  if (!query || typeof query !== "object") {
    return { ok: false, issues: [issue("query", "query is required")] };
  }

  const q = query as Partial<KnowledgeQuery>;
  if (!isNonEmptyString(q.id)) issues.push(issue("query.id", "id is required"));
  if (!isNonEmptyString(q.text) || q.text.trim().length < 2) {
    issues.push(issue("query.text", "text must be at least 2 characters"));
  }
  if (typeof q.limit !== "number" || q.limit < 1) {
    issues.push(issue("query.limit", "limit must be >= 1"));
  }
  if (typeof q.expandNeighbors !== "boolean") {
    issues.push(issue("query.expandNeighbors", "expandNeighbors must be boolean"));
  }
  if (q.readOnly !== true) {
    issues.push(issue("query.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: query as KnowledgeQuery };
}

export function validateKnowledgeHit(hit: unknown): SchemaResult<KnowledgeHit> {
  const issues: SchemaIssue[] = [];
  if (!hit || typeof hit !== "object") {
    return { ok: false, issues: [issue("hit", "hit is required")] };
  }

  const h = hit as Partial<KnowledgeHit>;
  if (!isNonEmptyString(h.id)) issues.push(issue("hit.id", "id is required"));
  if (!isNonEmptyString(h.label)) issues.push(issue("hit.label", "label is required"));
  if (!isNonEmptyString(h.evidence)) {
    issues.push(issue("hit.evidence", "evidence is required"));
  }
  if (h.hitKind !== "node" && h.hitKind !== "edge") {
    issues.push(issue("hit.hitKind", "hitKind must be node|edge"));
  }
  if (typeof h.score !== "number" || h.score < 0) {
    issues.push(issue("hit.score", "score must be a non-negative number"));
  }
  if (typeof h.rank !== "number" || h.rank < 1) {
    issues.push(issue("hit.rank", "rank must be >= 1"));
  }
  if (!Array.isArray(h.matchedTerms)) {
    issues.push(issue("hit.matchedTerms", "matchedTerms must be an array"));
  }
  if (h.readOnly !== true) {
    issues.push(issue("hit.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: hit as KnowledgeHit };
}

export function validateKnowledgeContext(
  context: unknown,
): SchemaResult<KnowledgeContext> {
  const issues: SchemaIssue[] = [];
  if (!context || typeof context !== "object") {
    return { ok: false, issues: [issue("context", "context is required")] };
  }

  const c = context as Partial<KnowledgeContext>;
  if (!isNonEmptyString(c.id)) issues.push(issue("context.id", "id is required"));
  if (!isNonEmptyString(c.queryId)) {
    issues.push(issue("context.queryId", "queryId is required"));
  }
  if (!isNonEmptyString(c.graphId)) {
    issues.push(issue("context.graphId", "graphId is required"));
  }
  if (!isNonEmptyString(c.title)) issues.push(issue("context.title", "title is required"));
  if (
    typeof c.status !== "string" ||
    !(KNOWLEDGE_CONTEXT_STATUSES as readonly string[]).includes(c.status)
  ) {
    issues.push(
      issue(
        "context.status",
        `status must be one of: ${KNOWLEDGE_CONTEXT_STATUSES.join(", ")}`,
      ),
    );
  }
  if (!Array.isArray(c.hits) || c.hits.length < 1) {
    issues.push(issue("context.hits", "hits must be non-empty"));
  }
  if (!Array.isArray(c.focusedNodes)) {
    issues.push(issue("context.focusedNodes", "focusedNodes must be an array"));
  }
  if (!Array.isArray(c.focusedEdges)) {
    issues.push(issue("context.focusedEdges", "focusedEdges must be an array"));
  }
  if (!Array.isArray(c.snippets)) {
    issues.push(issue("context.snippets", "snippets must be an array"));
  }
  if (!Array.isArray(c.narrative)) {
    issues.push(issue("context.narrative", "narrative must be an array"));
  }
  if (typeof c.hitCount === "number" && Array.isArray(c.hits) && c.hitCount !== c.hits.length) {
    issues.push(issue("context.hitCount", "hitCount must match hits.length"));
  }
  if (c.readOnly !== true) {
    issues.push(issue("context.readOnly", "readOnly must be true"));
  }

  if (Array.isArray(c.hits)) {
    for (let i = 0; i < c.hits.length; i++) {
      const result = validateKnowledgeHit(c.hits[i]);
      if (!result.ok) {
        issues.push(
          ...result.issues.map((it) => issue(`context.hits[${i}].${it.path}`, it.message)),
        );
      }
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: context as KnowledgeContext };
}

export function validateRetrievalKernelInput(
  input: unknown,
): SchemaResult<RetrievalKernelInput> {
  const issues: SchemaIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, issues: [issue("input", "input is required")] };
  }

  const i = input as Partial<RetrievalKernelInput>;
  const graphResult = validateKnowledgeGraphInput(i.graph);
  if (!graphResult.ok) issues.push(...graphResult.issues);

  if (!isNonEmptyString(i.queryText) || i.queryText.trim().length < 2) {
    issues.push(issue("input.queryText", "queryText must be at least 2 characters"));
  }

  if (i.limit !== undefined && (typeof i.limit !== "number" || i.limit < 1)) {
    issues.push(issue("input.limit", "limit must be >= 1"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: input as RetrievalKernelInput };
}

export function assertValidKnowledgeContext(context: KnowledgeContext): void {
  const result = validateKnowledgeContext(context);
  if (!result.ok) {
    throw new Error(
      `Invalid KnowledgeContext: ${result.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
}
