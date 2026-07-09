/**
 * V73 P2 — Knowledge dependency types (read-only)
 */

export const V73_KNOWLEDGE_DEPENDENCY_VERSION = "v73-knowledge-dependency-1" as const;
export const V73_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION = "v73-knowledge-dependency-freeze-1" as const;

export type KnowledgeImpact = "low" | "medium" | "high" | "critical";

export type KnowledgeNode = {
  id: string;
  knowledgeRef: string;
  label: string;
  order: number;
  required: boolean;
  description: string;
};

export type KnowledgeNodeManifest = {
  version: typeof V73_KNOWLEDGE_DEPENDENCY_VERSION;
  nodeCount: number;
  catalogComplete: boolean;
  nodes: KnowledgeNode[];
  summary: string;
};

export type Dependency = {
  id: string;
  upstream: string;
  downstream: string;
  required: boolean;
  optional: boolean;
  order: number;
  impact: KnowledgeImpact;
  description: string;
};

export type DependencyManifest = {
  version: typeof V73_KNOWLEDGE_DEPENDENCY_VERSION;
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

export type KnowledgeDependencyAdjacency = Record<string, string[]>;

export type KnowledgeDependencyGraph = {
  version: typeof V73_KNOWLEDGE_DEPENDENCY_VERSION;
  nodeCount: number;
  edgeCount: number;
  graphComplete: boolean;
  adjacency: KnowledgeDependencyAdjacency;
  cycleCheck: CycleCheck;
  summary: string;
};

export type KnowledgeDependencySignals = {
  knowledgeCatalogReady?: boolean;
  nodesComplete?: boolean;
  dependenciesComplete?: boolean;
  refsAligned?: boolean;
  graphComplete?: boolean;
  cycleCheckPass?: boolean;
  freezeVersionDeclared?: boolean;
};

export type KnowledgeDependencyReport = {
  version: typeof V73_KNOWLEDGE_DEPENDENCY_VERSION;
  freezeVersion: typeof V73_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  knowledgeCatalogVersion: string;
  knowledgeCatalogReady: boolean;
  nodes: KnowledgeNodeManifest;
  dependencies: DependencyManifest;
  graph: KnowledgeDependencyGraph;
  dependencyReady: boolean;
  readinessScore: number;
  summary: string;
};
