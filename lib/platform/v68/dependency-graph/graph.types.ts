/**
 * V68 P2 — Dependency graph types (read-only)
 */

export const V68_DEPENDENCY_GRAPH_VERSION = "v68-dependency-graph-1" as const;

export type DependencyKind = "sync" | "async" | "data" | "control" | "observability";

export type DependencyDirection = "outbound" | "inbound" | "bidirectional";

export type DependencyGraphSignals = {
  serviceCatalogReady?: boolean;
  typeCatalogComplete?: boolean;
  edgeCatalogComplete?: boolean;
  refsAligned?: boolean;
  graphBuildComplete?: boolean;
};

export type DependencyTypeDefinition = {
  id: string;
  kind: DependencyKind;
  label: string;
  blastRadius: "low" | "medium" | "high";
  required: boolean;
  description: string;
};

export type DependencyTypeManifest = {
  version: typeof V68_DEPENDENCY_GRAPH_VERSION;
  typeCount: number;
  kindCount: number;
  catalogComplete: boolean;
  types: DependencyTypeDefinition[];
  summary: string;
};

export type DependencyEdge = {
  id: string;
  fromServiceRef: string;
  toServiceRef: string;
  typeRef: string;
  direction: DependencyDirection;
  required: boolean;
  description: string;
};

export type DependencyEdgeManifest = {
  version: typeof V68_DEPENDENCY_GRAPH_VERSION;
  edgeCount: number;
  directionCount: number;
  catalogComplete: boolean;
  edges: DependencyEdge[];
  summary: string;
};

export type GraphAdjacencyList = Record<string, string[]>;

export type DependencyGraphManifest = {
  version: typeof V68_DEPENDENCY_GRAPH_VERSION;
  nodeCount: number;
  edgeCount: number;
  graphComplete: boolean;
  adjacency: GraphAdjacencyList;
  summary: string;
};

export type DependencyGraphReport = {
  version: typeof V68_DEPENDENCY_GRAPH_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  serviceCatalogVersion: string;
  serviceCatalogReady: boolean;
  dependencyTypes: DependencyTypeManifest;
  dependencyEdges: DependencyEdgeManifest;
  graph: DependencyGraphManifest;
  graphReady: boolean;
  readinessScore: number;
  summary: string;
};
