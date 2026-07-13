/**
 * E02-P4 — Knowledge Retrieval Engine types
 * KnowledgeGraph → Query → KnowledgeContext lifecycle
 */

import type {
  KnowledgeEdge,
  KnowledgeEdgeKind,
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeNodeKind,
} from "../knowledge/knowledge.types";

export const V102_KNOWLEDGE_RETRIEVAL_VERSION = "v102-knowledge-retrieval-1" as const;
export const V102_KNOWLEDGE_RETRIEVAL_FREEZE_VERSION =
  "v102-knowledge-retrieval-freeze-1" as const;

export type RetrievalLifecycleStage = "graph" | "query" | "context";

export type KnowledgeContextStatus = "pending" | "ranked" | "ready" | "failed";

export type KnowledgeHitKind = "node" | "edge";

export type KnowledgeQuery = {
  id: string;
  text: string;
  nodeKinds?: KnowledgeNodeKind[];
  edgeKinds?: KnowledgeEdgeKind[];
  limit: number;
  expandNeighbors: boolean;
  createdAt: string;
  readOnly: true;
};

export type KnowledgeHit = {
  id: string;
  hitKind: KnowledgeHitKind;
  score: number;
  rank: number;
  label: string;
  nodeId?: string;
  edgeId?: string;
  nodeKind?: KnowledgeNodeKind;
  edgeKind?: KnowledgeEdgeKind;
  evidence: string;
  matchedTerms: string[];
  readOnly: true;
};

export type KnowledgeContextSnippet = {
  id: string;
  label: string;
  kind: KnowledgeNodeKind | KnowledgeEdgeKind;
  text: string;
  score: number;
  readOnly: true;
};

export type KnowledgeContext = {
  id: string;
  queryId: string;
  graphId: string;
  status: KnowledgeContextStatus;
  title: string;
  hitCount: number;
  nodeHitCount: number;
  edgeHitCount: number;
  topScore: number;
  hits: KnowledgeHit[];
  focusedNodes: KnowledgeNode[];
  focusedEdges: KnowledgeEdge[];
  snippets: KnowledgeContextSnippet[];
  narrative: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type RetrievalLifecycleTransition = {
  from: RetrievalLifecycleStage;
  to: RetrievalLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type RetrievalLifecycle = {
  current: RetrievalLifecycleStage;
  stages: RetrievalLifecycleStage[];
  transitions: RetrievalLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type RetrievalKernelInput = {
  deploymentId?: string;
  graph: KnowledgeGraph;
  queryText: string;
  titleHint?: string;
  nodeKinds?: KnowledgeNodeKind[];
  edgeKinds?: KnowledgeEdgeKind[];
  limit?: number;
  expandNeighbors?: boolean;
};

export type RetrievalKernelResult = {
  version: typeof V102_KNOWLEDGE_RETRIEVAL_VERSION;
  freezeVersion: typeof V102_KNOWLEDGE_RETRIEVAL_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  graph: KnowledgeGraph;
  query: KnowledgeQuery;
  context: KnowledgeContext | null;
  lifecycle: RetrievalLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};
