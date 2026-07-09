/**
 * V72 P2 — Signal dependency types (read-only)
 */

export const V72_SIGNAL_DEPENDENCY_VERSION = "v72-signal-dependency-1" as const;
export const V72_SIGNAL_DEPENDENCY_FREEZE_VERSION = "v72-signal-dependency-freeze-1" as const;

export type SignalImpact = "low" | "medium" | "high" | "critical";

export type SignalNode = {
  id: string;
  insightRef: string;
  label: string;
  order: number;
  required: boolean;
  description: string;
};

export type SignalNodeManifest = {
  version: typeof V72_SIGNAL_DEPENDENCY_VERSION;
  nodeCount: number;
  catalogComplete: boolean;
  nodes: SignalNode[];
  summary: string;
};

export type Dependency = {
  id: string;
  upstream: string;
  downstream: string;
  required: boolean;
  optional: boolean;
  order: number;
  impact: SignalImpact;
  description: string;
};

export type DependencyManifest = {
  version: typeof V72_SIGNAL_DEPENDENCY_VERSION;
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

export type SignalDependencyAdjacency = Record<string, string[]>;

export type SignalDependencyGraph = {
  version: typeof V72_SIGNAL_DEPENDENCY_VERSION;
  nodeCount: number;
  edgeCount: number;
  graphComplete: boolean;
  adjacency: SignalDependencyAdjacency;
  cycleCheck: CycleCheck;
  summary: string;
};

export type SignalDependencySignals = {
  intelligenceCatalogReady?: boolean;
  nodesComplete?: boolean;
  dependenciesComplete?: boolean;
  refsAligned?: boolean;
  graphComplete?: boolean;
  cycleCheckPass?: boolean;
  freezeVersionDeclared?: boolean;
};

export type SignalDependencyReport = {
  version: typeof V72_SIGNAL_DEPENDENCY_VERSION;
  freezeVersion: typeof V72_SIGNAL_DEPENDENCY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  intelligenceCatalogVersion: string;
  intelligenceCatalogReady: boolean;
  nodes: SignalNodeManifest;
  dependencies: DependencyManifest;
  graph: SignalDependencyGraph;
  dependencyReady: boolean;
  readinessScore: number;
  summary: string;
};
