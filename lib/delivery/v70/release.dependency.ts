/**
 * V70 P2 — Release dependency types (read-only)
 */

export const V70_RELEASE_DEPENDENCY_VERSION = "v70-release-dependency-1" as const;
export const V70_RELEASE_DEPENDENCY_FREEZE_VERSION =
  "v70-release-dependency-freeze-1" as const;

export type DependencyStrength = "required" | "optional";

export type ReleaseImpact = "low" | "medium" | "high" | "critical";

export type ReleaseNode = {
  id: string;
  releaseRef: string;
  label: string;
  order: number;
  required: boolean;
  description: string;
};

export type ReleaseNodeManifest = {
  version: typeof V70_RELEASE_DEPENDENCY_VERSION;
  nodeCount: number;
  catalogComplete: boolean;
  nodes: ReleaseNode[];
  summary: string;
};

export type Dependency = {
  id: string;
  upstream: string;
  downstream: string;
  required: boolean;
  optional: boolean;
  order: number;
  impact: ReleaseImpact;
  description: string;
};

export type DependencyManifest = {
  version: typeof V70_RELEASE_DEPENDENCY_VERSION;
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

export type ReleaseDependencyAdjacency = Record<string, string[]>;

export type ReleaseDependencyGraph = {
  version: typeof V70_RELEASE_DEPENDENCY_VERSION;
  nodeCount: number;
  edgeCount: number;
  graphComplete: boolean;
  adjacency: ReleaseDependencyAdjacency;
  cycleCheck: CycleCheck;
  summary: string;
};

export type ReleaseDependencySignals = {
  releaseCatalogReady?: boolean;
  nodesComplete?: boolean;
  dependenciesComplete?: boolean;
  refsAligned?: boolean;
  graphComplete?: boolean;
  cycleCheckPass?: boolean;
  freezeVersionDeclared?: boolean;
};

export type ReleaseDependencyReport = {
  version: typeof V70_RELEASE_DEPENDENCY_VERSION;
  freezeVersion: typeof V70_RELEASE_DEPENDENCY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  releaseCatalogVersion: string;
  releaseCatalogReady: boolean;
  nodes: ReleaseNodeManifest;
  dependencies: DependencyManifest;
  graph: ReleaseDependencyGraph;
  dependencyReady: boolean;
  readinessScore: number;
  summary: string;
};
