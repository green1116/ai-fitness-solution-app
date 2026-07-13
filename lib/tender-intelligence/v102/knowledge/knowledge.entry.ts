/**
 * E02-P1 — Tender Knowledge Graph entry
 */

export {
  assertKnowledgeKernelPass,
  buildKnowledgeEdge,
  buildKnowledgeEdges,
  buildKnowledgeGraph,
  buildKnowledgeKernel,
  buildKnowledgeLifecycle,
  buildKnowledgeNode,
  buildKnowledgeNodes,
} from "./knowledge.builder";

export {
  assertValidKnowledgeGraph,
  KNOWLEDGE_EDGE_KINDS,
  KNOWLEDGE_GRAPH_STATUSES,
  KNOWLEDGE_LIFECYCLE_STAGES,
  KNOWLEDGE_NODE_KINDS,
  validateKnowledgeEdge,
  validateKnowledgeGraph,
  validateKnowledgeKernelInput,
  validateKnowledgeNode,
} from "./knowledge.schema";

export type { SchemaIssue, SchemaResult } from "./knowledge.schema";

export {
  V102_TENDER_KNOWLEDGE_FREEZE_VERSION,
  V102_TENDER_KNOWLEDGE_VERSION,
} from "./knowledge.types";

export type {
  KnowledgeEdge,
  KnowledgeEdgeKind,
  KnowledgeGraph,
  KnowledgeGraphStatus,
  KnowledgeKernelInput,
  KnowledgeKernelResult,
  KnowledgeLifecycle,
  KnowledgeLifecycleStage,
  KnowledgeLifecycleTransition,
  KnowledgeNode,
  KnowledgeNodeKind,
  KnowledgeSeedEdge,
  KnowledgeSeedNode,
} from "./knowledge.types";

import {
  assertKnowledgeKernelPass,
  buildKnowledgeKernel,
} from "./knowledge.builder";
import type {
  KnowledgeKernelInput,
  KnowledgeKernelResult,
} from "./knowledge.types";

export function runKnowledgeKernel(input: KnowledgeKernelInput): KnowledgeKernelResult {
  return buildKnowledgeKernel(input);
}

export function runKnowledgeKernelOrThrow(
  input: KnowledgeKernelInput,
): KnowledgeKernelResult & {
  ready: true;
  graph: NonNullable<KnowledgeKernelResult["graph"]>;
} {
  const result = buildKnowledgeKernel(input);
  assertKnowledgeKernelPass(result);
  return result;
}

export function formatKnowledgeKernelSummary(result: KnowledgeKernelResult): string {
  const lines = [
    "V102 Tender Knowledge Graph Kernel",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  nodes: ${result.nodes.length}`,
    `  edges: ${result.edges.length}`,
    `  graph: ${
      result.graph
        ? `status=${result.graph.status} kinds=${result.graph.kindCoverage.length} title=${result.graph.title}`
        : "none"
    }`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
