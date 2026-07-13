/**
 * E02-P4 — Knowledge Retrieval entry
 */

export {
  assertRetrievalKernelPass,
  buildKnowledgeContext,
  buildKnowledgeQuery,
  buildRetrievalKernel,
  buildRetrievalLifecycle,
  rankKnowledgeHits,
} from "./retrieval.builder";

export {
  assertValidKnowledgeContext,
  KNOWLEDGE_CONTEXT_STATUSES,
  KNOWLEDGE_EDGE_KINDS,
  KNOWLEDGE_NODE_KINDS,
  RETRIEVAL_LIFECYCLE_STAGES,
  validateKnowledgeContext,
  validateKnowledgeGraphInput,
  validateKnowledgeHit,
  validateKnowledgeQuery,
  validateRetrievalKernelInput,
} from "./retrieval.schema";

export type { SchemaIssue, SchemaResult } from "./retrieval.schema";

export {
  V102_KNOWLEDGE_RETRIEVAL_FREEZE_VERSION,
  V102_KNOWLEDGE_RETRIEVAL_VERSION,
} from "./retrieval.types";

export type {
  KnowledgeContext,
  KnowledgeContextSnippet,
  KnowledgeContextStatus,
  KnowledgeHit,
  KnowledgeHitKind,
  KnowledgeQuery,
  RetrievalKernelInput,
  RetrievalKernelResult,
  RetrievalLifecycle,
  RetrievalLifecycleStage,
  RetrievalLifecycleTransition,
} from "./retrieval.types";

import {
  assertRetrievalKernelPass,
  buildRetrievalKernel,
} from "./retrieval.builder";
import type {
  RetrievalKernelInput,
  RetrievalKernelResult,
} from "./retrieval.types";

export function runRetrievalKernel(
  input: RetrievalKernelInput,
): RetrievalKernelResult {
  return buildRetrievalKernel(input);
}

export function runRetrievalKernelOrThrow(
  input: RetrievalKernelInput,
): RetrievalKernelResult & {
  ready: true;
  context: NonNullable<RetrievalKernelResult["context"]>;
} {
  const result = buildRetrievalKernel(input);
  assertRetrievalKernelPass(result);
  return result;
}

export function formatRetrievalKernelSummary(
  result: RetrievalKernelResult,
): string {
  const lines = [
    "V102 Knowledge Retrieval Engine",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  graph: ${result.graph.title} (nodes=${result.graph.nodeCount}, edges=${result.graph.edgeCount})`,
    `  query: ${result.query.text} (limit=${result.query.limit})`,
    `  context: ${
      result.context
        ? `status=${result.context.status} hits=${result.context.hitCount} top=${result.context.topScore}`
        : "none"
    }`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
