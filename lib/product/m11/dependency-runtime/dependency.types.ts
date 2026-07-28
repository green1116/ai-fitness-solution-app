/**
 * Product M11 — Knowledge Dependency Runtime domain types
 */

import type {
  KNOWLEDGE_DEPENDENCY_EDGE_STATUSES,
  KNOWLEDGE_DEPENDENCY_GRAPH_KINDS,
  KNOWLEDGE_DEPENDENCY_GRAPH_STATUSES,
  KNOWLEDGE_DEPENDENCY_IMPACTS,
  KNOWLEDGE_DEPENDENCY_NODE_STATUSES,
  KNOWLEDGE_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_KNOWLEDGE_DEPENDENCY_BASE,
  PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
  PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION,
} from "./dependency.constants";

export type KnowledgeDependencyGraphKind =
  (typeof KNOWLEDGE_DEPENDENCY_GRAPH_KINDS)[number];
export type KnowledgeDependencyGraphStatus =
  (typeof KNOWLEDGE_DEPENDENCY_GRAPH_STATUSES)[number];
export type KnowledgeDependencyNodeStatus =
  (typeof KNOWLEDGE_DEPENDENCY_NODE_STATUSES)[number];
export type KnowledgeDependencyEdgeStatus =
  (typeof KNOWLEDGE_DEPENDENCY_EDGE_STATUSES)[number];
export type KnowledgeDependencyImpact =
  (typeof KNOWLEDGE_DEPENDENCY_IMPACTS)[number];
export type KnowledgeDependencyReadinessVerdict =
  (typeof KNOWLEDGE_DEPENDENCY_READINESS_VERDICTS)[number];
export type KnowledgeDependencyMetadata = Record<string, unknown>;

/** Dependency graph container (in-memory). */
export type KnowledgeDependencyGraph = {
  id: string;
  graphKey: string;
  kind: KnowledgeDependencyGraphKind;
  status: KnowledgeDependencyGraphStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: KnowledgeDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeDependencyGraphInput = {
  id?: string;
  graphKey: string;
  kind: KnowledgeDependencyGraphKind;
  title: string;
  summary: string;
  metadata?: KnowledgeDependencyMetadata;
};

export type UpdateKnowledgeDependencyGraphStatusInput = {
  graphId: string;
  status: KnowledgeDependencyGraphStatus;
};

/** Graph node — soft-ref to catalogKey. */
export type KnowledgeDependencyNode = {
  id: string;
  graphId: string;
  nodeKey: string;
  sequence: number;
  status: KnowledgeDependencyNodeStatus;
  catalogKeyRef: string;
  summary: string;
  detail: string;
  metadata: KnowledgeDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeDependencyNodeInput = {
  id?: string;
  graphId: string;
  nodeKey: string;
  sequence: number;
  catalogKeyRef: string;
  summary: string;
  metadata?: KnowledgeDependencyMetadata;
};

export type UpdateKnowledgeDependencyNodeStatusInput = {
  nodeId: string;
  status: KnowledgeDependencyNodeStatus;
};

/** Directed dependency edge between declared nodes. */
export type KnowledgeDependencyEdge = {
  id: string;
  graphId: string;
  edgeKey: string;
  upstreamNodeId: string;
  downstreamNodeId: string;
  impact: KnowledgeDependencyImpact;
  required: boolean;
  status: KnowledgeDependencyEdgeStatus;
  detail: string;
  metadata: KnowledgeDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindKnowledgeDependencyEdgeInput = {
  id?: string;
  graphId: string;
  edgeKey: string;
  upstreamNodeId: string;
  downstreamNodeId: string;
  impact: KnowledgeDependencyImpact;
  required?: boolean;
  metadata?: KnowledgeDependencyMetadata;
};

export type KnowledgeDependencyReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type KnowledgeDependencyReadinessResult = {
  verdict: KnowledgeDependencyReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: KnowledgeDependencyReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type KnowledgeDependencyManifest = {
  dependencyRuntimeId: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_ID;
  version: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION;
  base: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_BASE;
  graphCount: number;
  nodeCount: number;
  edgeCount: number;
  acyclic: boolean;
  checksum: string;
  createdAt: string;
};
