/**
 * Product M14 — Intelligence Dependency Runtime domain types
 */

import type {
  INTELLIGENCE_DEPENDENCY_EDGE_STATUSES,
  INTELLIGENCE_DEPENDENCY_GRAPH_KINDS,
  INTELLIGENCE_DEPENDENCY_GRAPH_STATUSES,
  INTELLIGENCE_DEPENDENCY_IMPACTS,
  INTELLIGENCE_DEPENDENCY_NODE_STATUSES,
  INTELLIGENCE_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_INTELLIGENCE_DEPENDENCY_BASE,
  PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_DEPENDENCY_ID,
  PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION,
} from "./dependency.constants";

export type IntelligenceDependencyGraphKind =
  (typeof INTELLIGENCE_DEPENDENCY_GRAPH_KINDS)[number];
export type IntelligenceDependencyGraphStatus =
  (typeof INTELLIGENCE_DEPENDENCY_GRAPH_STATUSES)[number];
export type IntelligenceDependencyNodeStatus =
  (typeof INTELLIGENCE_DEPENDENCY_NODE_STATUSES)[number];
export type IntelligenceDependencyEdgeStatus =
  (typeof INTELLIGENCE_DEPENDENCY_EDGE_STATUSES)[number];
export type IntelligenceDependencyImpact =
  (typeof INTELLIGENCE_DEPENDENCY_IMPACTS)[number];
export type IntelligenceDependencyReadinessVerdict =
  (typeof INTELLIGENCE_DEPENDENCY_READINESS_VERDICTS)[number];
export type IntelligenceDependencyMetadata = Record<string, unknown>;

/** Dependency graph container (in-memory). */
export type IntelligenceDependencyGraph = {
  id: string;
  graphKey: string;
  kind: IntelligenceDependencyGraphKind;
  status: IntelligenceDependencyGraphStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: IntelligenceDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceDependencyGraphInput = {
  id?: string;
  graphKey: string;
  kind: IntelligenceDependencyGraphKind;
  title: string;
  summary: string;
  metadata?: IntelligenceDependencyMetadata;
};

export type UpdateIntelligenceDependencyGraphStatusInput = {
  graphId: string;
  status: IntelligenceDependencyGraphStatus;
};

/** Graph node — soft-ref to catalogKey. */
export type IntelligenceDependencyNode = {
  id: string;
  graphId: string;
  nodeKey: string;
  sequence: number;
  status: IntelligenceDependencyNodeStatus;
  catalogKeyRef: string;
  summary: string;
  detail: string;
  metadata: IntelligenceDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceDependencyNodeInput = {
  id?: string;
  graphId: string;
  nodeKey: string;
  sequence: number;
  catalogKeyRef: string;
  summary: string;
  metadata?: IntelligenceDependencyMetadata;
};

export type UpdateIntelligenceDependencyNodeStatusInput = {
  nodeId: string;
  status: IntelligenceDependencyNodeStatus;
};

/** Directed dependency edge between declared nodes. */
export type IntelligenceDependencyEdge = {
  id: string;
  graphId: string;
  edgeKey: string;
  upstreamNodeId: string;
  downstreamNodeId: string;
  impact: IntelligenceDependencyImpact;
  required: boolean;
  status: IntelligenceDependencyEdgeStatus;
  detail: string;
  metadata: IntelligenceDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindIntelligenceDependencyEdgeInput = {
  id?: string;
  graphId: string;
  edgeKey: string;
  upstreamNodeId: string;
  downstreamNodeId: string;
  impact: IntelligenceDependencyImpact;
  required?: boolean;
  metadata?: IntelligenceDependencyMetadata;
};

export type IntelligenceDependencyReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IntelligenceDependencyReadinessResult = {
  verdict: IntelligenceDependencyReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: IntelligenceDependencyReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type IntelligenceDependencyManifest = {
  dependencyRuntimeId: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_ID;
  version: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION;
  base: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_BASE;
  graphCount: number;
  nodeCount: number;
  edgeCount: number;
  acyclic: boolean;
  checksum: string;
  createdAt: string;
};
