/**
 * V71 P2 — Workflow dependency types (read-only)
 */

export const V71_WORKFLOW_DEPENDENCY_VERSION = "v71-workflow-dependency-1" as const;
export const V71_WORKFLOW_DEPENDENCY_FREEZE_VERSION =
  "v71-workflow-dependency-freeze-1" as const;

export type WorkflowImpact = "low" | "medium" | "high" | "critical";

export type WorkflowNode = {
  id: string;
  orchestrationRef: string;
  label: string;
  order: number;
  required: boolean;
  description: string;
};

export type WorkflowNodeManifest = {
  version: typeof V71_WORKFLOW_DEPENDENCY_VERSION;
  nodeCount: number;
  catalogComplete: boolean;
  nodes: WorkflowNode[];
  summary: string;
};

export type Dependency = {
  id: string;
  upstream: string;
  downstream: string;
  required: boolean;
  optional: boolean;
  order: number;
  impact: WorkflowImpact;
  description: string;
};

export type DependencyManifest = {
  version: typeof V71_WORKFLOW_DEPENDENCY_VERSION;
  edgeCount: number;
  requiredCount: number;
  optionalCount: number;
  catalogComplete: boolean;
  dependencies: Dependency[];
  summary: string;
};

export type CycleCheck = {
  acyclic: boolean;
  checkedNodeCount: number;
  checkedEdgeCount: number;
  cycleDetected: boolean;
  summary: string;
};

export type WorkflowDependencyAdjacency = Record<string, string[]>;

export type WorkflowDependencyGraph = {
  version: typeof V71_WORKFLOW_DEPENDENCY_VERSION;
  nodeCount: number;
  edgeCount: number;
  graphComplete: boolean;
  adjacency: WorkflowDependencyAdjacency;
  cycleCheck: CycleCheck;
  summary: string;
};

export type WorkflowDependencySignals = {
  orchestrationCatalogReady?: boolean;
  nodesComplete?: boolean;
  dependenciesComplete?: boolean;
  refsAligned?: boolean;
  graphComplete?: boolean;
  cycleCheckPass?: boolean;
  freezeVersionDeclared?: boolean;
};

export type WorkflowDependencyReport = {
  version: typeof V71_WORKFLOW_DEPENDENCY_VERSION;
  freezeVersion: typeof V71_WORKFLOW_DEPENDENCY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  orchestrationCatalogVersion: string;
  orchestrationCatalogReady: boolean;
  nodes: WorkflowNodeManifest;
  dependencies: DependencyManifest;
  graph: WorkflowDependencyGraph;
  dependencyReady: boolean;
  readinessScore: number;
  summary: string;
};
