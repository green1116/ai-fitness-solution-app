/**
 * Product M12 — Agent Dependency Runtime domain types
 */

import type {
  AGENT_DEPENDENCY_EDGE_STATUSES,
  AGENT_DEPENDENCY_GRAPH_KINDS,
  AGENT_DEPENDENCY_GRAPH_STATUSES,
  AGENT_DEPENDENCY_IMPACTS,
  AGENT_DEPENDENCY_NODE_STATUSES,
  AGENT_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_AGENT_DEPENDENCY_BASE,
  PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_AGENT_DEPENDENCY_ID,
  PRODUCT_AGENT_DEPENDENCY_VERSION,
} from "./dependency.constants";

export type AgentDependencyGraphKind =
  (typeof AGENT_DEPENDENCY_GRAPH_KINDS)[number];
export type AgentDependencyGraphStatus =
  (typeof AGENT_DEPENDENCY_GRAPH_STATUSES)[number];
export type AgentDependencyNodeStatus =
  (typeof AGENT_DEPENDENCY_NODE_STATUSES)[number];
export type AgentDependencyEdgeStatus =
  (typeof AGENT_DEPENDENCY_EDGE_STATUSES)[number];
export type AgentDependencyImpact = (typeof AGENT_DEPENDENCY_IMPACTS)[number];
export type AgentDependencyReadinessVerdict =
  (typeof AGENT_DEPENDENCY_READINESS_VERDICTS)[number];
export type AgentDependencyMetadata = Record<string, unknown>;

/** Dependency graph container (in-memory). */
export type AgentDependencyGraph = {
  id: string;
  graphKey: string;
  kind: AgentDependencyGraphKind;
  status: AgentDependencyGraphStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: AgentDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentDependencyGraphInput = {
  id?: string;
  graphKey: string;
  kind: AgentDependencyGraphKind;
  title: string;
  summary: string;
  metadata?: AgentDependencyMetadata;
};

export type UpdateAgentDependencyGraphStatusInput = {
  graphId: string;
  status: AgentDependencyGraphStatus;
};

/** Graph node — soft-ref to catalogKey. */
export type AgentDependencyNode = {
  id: string;
  graphId: string;
  nodeKey: string;
  sequence: number;
  status: AgentDependencyNodeStatus;
  catalogKeyRef: string;
  summary: string;
  detail: string;
  metadata: AgentDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentDependencyNodeInput = {
  id?: string;
  graphId: string;
  nodeKey: string;
  sequence: number;
  catalogKeyRef: string;
  summary: string;
  metadata?: AgentDependencyMetadata;
};

export type UpdateAgentDependencyNodeStatusInput = {
  nodeId: string;
  status: AgentDependencyNodeStatus;
};

/** Directed dependency edge between declared nodes. */
export type AgentDependencyEdge = {
  id: string;
  graphId: string;
  edgeKey: string;
  upstreamNodeId: string;
  downstreamNodeId: string;
  impact: AgentDependencyImpact;
  required: boolean;
  status: AgentDependencyEdgeStatus;
  detail: string;
  metadata: AgentDependencyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAgentDependencyEdgeInput = {
  id?: string;
  graphId: string;
  edgeKey: string;
  upstreamNodeId: string;
  downstreamNodeId: string;
  impact: AgentDependencyImpact;
  required?: boolean;
  metadata?: AgentDependencyMetadata;
};

export type AgentDependencyReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AgentDependencyReadinessResult = {
  verdict: AgentDependencyReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AgentDependencyReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AgentDependencyManifest = {
  dependencyRuntimeId: typeof PRODUCT_AGENT_DEPENDENCY_ID;
  version: typeof PRODUCT_AGENT_DEPENDENCY_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION;
  base: typeof PRODUCT_AGENT_DEPENDENCY_BASE;
  graphCount: number;
  nodeCount: number;
  edgeCount: number;
  acyclic: boolean;
  checksum: string;
  createdAt: string;
};
