/**
 * V69 P2 — Architecture dependency types (read-only)
 */

export const V69_ARCHITECTURE_DEPENDENCY_VERSION = "v69-architecture-dependency-1" as const;
export const V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION =
  "v69-architecture-dependency-freeze-1" as const;

export type ArchitectureDependencyKind =
  | "sync"
  | "async"
  | "data"
  | "control"
  | "observability";

export type ArchitectureDependencyDirection = "outbound" | "inbound" | "bidirectional";

export type ArchitectureDependencyStrengthLevel = "weak" | "moderate" | "strong" | "critical";

export type ArchitectureDependencyBoundaryKind =
  | "layer-adjacent"
  | "cross-layer"
  | "security-envelope"
  | "governance-readonly"
  | "integration-signal";

export type ArchitectureDependencySignals = {
  architectureCatalogReady?: boolean;
  kindCatalogComplete?: boolean;
  strengthCatalogComplete?: boolean;
  boundaryCatalogComplete?: boolean;
  edgeCatalogComplete?: boolean;
  refsAligned?: boolean;
  graphBuildComplete?: boolean;
  freezeLockIntact?: boolean;
};

export type ArchitectureDependencyKindDefinition = {
  id: string;
  kind: ArchitectureDependencyKind;
  label: string;
  blastRadius: "low" | "medium" | "high";
  required: boolean;
  description: string;
};

export type ArchitectureDependencyKindManifest = {
  version: typeof V69_ARCHITECTURE_DEPENDENCY_VERSION;
  kindCount: number;
  uniqueKindCount: number;
  catalogComplete: boolean;
  kinds: ArchitectureDependencyKindDefinition[];
  summary: string;
};

export type ArchitectureDependencyStrengthDefinition = {
  id: string;
  level: ArchitectureDependencyStrengthLevel;
  weight: number;
  couplingScore: number;
  required: boolean;
  description: string;
};

export type ArchitectureDependencyStrengthManifest = {
  version: typeof V69_ARCHITECTURE_DEPENDENCY_VERSION;
  strengthCount: number;
  levelCount: number;
  catalogComplete: boolean;
  strengths: ArchitectureDependencyStrengthDefinition[];
  summary: string;
};

export type ArchitectureDependencyBoundaryDefinition = {
  id: string;
  kind: ArchitectureDependencyBoundaryKind;
  label: string;
  allowed: boolean;
  required: boolean;
  description: string;
};

export type ArchitectureDependencyBoundaryManifest = {
  version: typeof V69_ARCHITECTURE_DEPENDENCY_VERSION;
  boundaryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  boundaries: ArchitectureDependencyBoundaryDefinition[];
  summary: string;
};

export type ArchitectureDependencyEdge = {
  id: string;
  fromArcDefRef: string;
  toArcDefRef: string;
  kindRef: string;
  strengthRef: string;
  boundaryRef: string;
  direction: ArchitectureDependencyDirection;
  required: boolean;
  description: string;
};

export type ArchitectureDependencyEdgeManifest = {
  version: typeof V69_ARCHITECTURE_DEPENDENCY_VERSION;
  edgeCount: number;
  directionCount: number;
  catalogComplete: boolean;
  edges: ArchitectureDependencyEdge[];
  summary: string;
};

export type ArchitectureDependencyAdjacencyList = Record<string, string[]>;

export type ArchitectureDependencyGraphManifest = {
  version: typeof V69_ARCHITECTURE_DEPENDENCY_VERSION;
  nodeCount: number;
  edgeCount: number;
  graphComplete: boolean;
  adjacency: ArchitectureDependencyAdjacencyList;
  summary: string;
};

export type ArchitectureDependencyRegistry = {
  version: typeof V69_ARCHITECTURE_DEPENDENCY_VERSION;
  kindIds: string[];
  strengthIds: string[];
  boundaryIds: string[];
  edgeIds: string[];
  totalEntries: number;
  registryComplete: boolean;
  summary: string;
};

export type ArchitectureDependencyReport = {
  version: typeof V69_ARCHITECTURE_DEPENDENCY_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  architectureCatalogVersion: string;
  architectureCatalogReady: boolean;
  dependencyKinds: ArchitectureDependencyKindManifest;
  dependencyStrengths: ArchitectureDependencyStrengthManifest;
  dependencyBoundaries: ArchitectureDependencyBoundaryManifest;
  dependencyEdges: ArchitectureDependencyEdgeManifest;
  graph: ArchitectureDependencyGraphManifest;
  registry: ArchitectureDependencyRegistry;
  dependencyReady: boolean;
  readinessScore: number;
  summary: string;
};
