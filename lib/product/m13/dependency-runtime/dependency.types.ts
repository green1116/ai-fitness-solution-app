/**
 * Product M13 — OS Dependency Runtime domain types
 */

import type {
  OS_DEPENDENCY_EDGE_STATUSES,
  OS_DEPENDENCY_GRAPH_KINDS,
  OS_DEPENDENCY_GRAPH_STATUSES,
  OS_DEPENDENCY_IMPACTS,
  OS_DEPENDENCY_NODE_STATUSES,
  OS_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_OS_DEPENDENCY_BASE,
  PRODUCT_OS_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_OS_DEPENDENCY_ID,
  PRODUCT_OS_DEPENDENCY_VERSION,
} from "./dependency.constants";

export type OsDependencyGraphKind =
  (typeof OS_DEPENDENCY_GRAPH_KINDS)[number];
export type OsDependencyGraphStatus =
  (typeof OS_DEPENDENCY_GRAPH_STATUSES)[number];
export type OsDependencyNodeStatus =
  (typeof OS_DEPENDENCY_NODE_STATUSES)[number];
export type OsDependencyEdgeStatus =
  (typeof OS_DEPENDENCY_EDGE_STATUSES)[number];
export type OsDependencyImpact = (typeof OS_DEPENDENCY_IMPACTS)[number];
export type OsDependencyReadinessVerdict =
  (typeof OS_DEPENDENCY_READINESS_VERDICTS)[number];
export type OsDependencyMetadata = Record<string, unknown>;

/** Dependency graph container (in-memory). */
export type OsDependencyGraph = {
  id: string;
  graphKey: string;
  kind: OsDependencyGraphKind;
  status: OsDependencyGraphStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: OsDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsDependencyGraphInput = {
  id?: string;
  graphKey: string;
  kind: OsDependencyGraphKind;
  title: string;
  summary: string;
  metadata?: OsDependencyMetadata;
};

export type UpdateOsDependencyGraphStatusInput = {
  graphId: string;
  status: OsDependencyGraphStatus;
};

/** Graph node — soft-ref to catalogKey. */
export type OsDependencyNode = {
  id: string;
  graphId: string;
  nodeKey: string;
  sequence: number;
  status: OsDependencyNodeStatus;
  catalogKeyRef: string;
  summary: string;
  detail: string;
  metadata: OsDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsDependencyNodeInput = {
  id?: string;
  graphId: string;
  nodeKey: string;
  sequence: number;
  catalogKeyRef: string;
  summary: string;
  metadata?: OsDependencyMetadata;
};

export type UpdateOsDependencyNodeStatusInput = {
  nodeId: string;
  status: OsDependencyNodeStatus;
};

/** Directed dependency edge between declared nodes. */
export type OsDependencyEdge = {
  id: string;
  graphId: string;
  edgeKey: string;
  upstreamNodeId: string;
  downstreamNodeId: string;
  impact: OsDependencyImpact;
  required: boolean;
  status: OsDependencyEdgeStatus;
  detail: string;
  metadata: OsDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindOsDependencyEdgeInput = {
  id?: string;
  graphId: string;
  edgeKey: string;
  upstreamNodeId: string;
  downstreamNodeId: string;
  impact: OsDependencyImpact;
  required?: boolean;
  metadata?: OsDependencyMetadata;
};

export type OsDependencyReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OsDependencyReadinessResult = {
  verdict: OsDependencyReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OsDependencyReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OsDependencyManifest = {
  dependencyRuntimeId: typeof PRODUCT_OS_DEPENDENCY_ID;
  version: typeof PRODUCT_OS_DEPENDENCY_VERSION;
  freezeVersion: typeof PRODUCT_OS_DEPENDENCY_FREEZE_VERSION;
  base: typeof PRODUCT_OS_DEPENDENCY_BASE;
  graphCount: number;
  nodeCount: number;
  edgeCount: number;
  acyclic: boolean;
  checksum: string;
  createdAt: string;
};
