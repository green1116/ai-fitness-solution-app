/**
 * V69 P2 — Architecture dependency builder (adjacency + report, read-only)
 */
import { buildArchitectureCatalogReport } from "../architecture-catalog/catalog.builder";
import { V69_ARCHITECTURE_CATALOG_VERSION } from "../architecture-catalog/catalog.types";
import { ARCHITECTURE_DEFINITION_CATALOG } from "../architecture-catalog/architecture.definition.catalog";

import { isArchitectureDependencyRefsAligned } from "./alignment.catalog";
import { buildArchitectureDependencyBoundaryManifest } from "./dependency.boundary.catalog";
import {
  ARCHITECTURE_DEPENDENCY_EDGE_CATALOG,
  buildArchitectureDependencyEdgeManifest,
} from "./dependency.edge.catalog";
import { buildArchitectureDependencyKindManifest } from "./dependency.kind.catalog";
import { buildArchitectureDependencyStrengthManifest } from "./dependency.strength.catalog";
import { buildArchitectureDependencyRegistry } from "./dependency.registry";
import type {
  ArchitectureDependencyAdjacencyList,
  ArchitectureDependencyGraphManifest,
  ArchitectureDependencyReport,
  ArchitectureDependencySignals,
} from "./dependency.types";
import { V69_ARCHITECTURE_DEPENDENCY_VERSION } from "./dependency.types";
import {
  architectureDependencyFreezeLockMatchesExpected,
  isArchitectureDependencyFreezeLockIntact,
} from "./freeze.lock";

const DEFAULT_SIGNALS: ArchitectureDependencySignals = {
  architectureCatalogReady: true,
  kindCatalogComplete: true,
  strengthCatalogComplete: true,
  boundaryCatalogComplete: true,
  edgeCatalogComplete: true,
  refsAligned: true,
  graphBuildComplete: true,
  freezeLockIntact: true,
};

export function buildDeclarativeArchitectureAdjacencyList(): ArchitectureDependencyAdjacencyList {
  const adj: ArchitectureDependencyAdjacencyList = {};

  for (const def of ARCHITECTURE_DEFINITION_CATALOG) {
    adj[def.id] = [];
  }

  for (const edge of ARCHITECTURE_DEPENDENCY_EDGE_CATALOG) {
    if (edge.direction === "outbound" || edge.direction === "bidirectional") {
      adj[edge.fromArcDefRef] = [...(adj[edge.fromArcDefRef] ?? []), edge.toArcDefRef];
    }
    if (edge.direction === "inbound") {
      adj[edge.toArcDefRef] = [...(adj[edge.toArcDefRef] ?? []), edge.fromArcDefRef];
    }
    if (edge.direction === "bidirectional") {
      adj[edge.toArcDefRef] = [...(adj[edge.toArcDefRef] ?? []), edge.fromArcDefRef];
    }
  }

  return adj;
}

export function buildArchitectureDependencyGraphManifest(): ArchitectureDependencyGraphManifest {
  const adjacency = buildDeclarativeArchitectureAdjacencyList();
  const nodeCount = Object.keys(adjacency).length;
  const edgeCount = ARCHITECTURE_DEPENDENCY_EDGE_CATALOG.length;
  const graphComplete = nodeCount >= 6 && edgeCount >= 6;

  return {
    version: V69_ARCHITECTURE_DEPENDENCY_VERSION,
    nodeCount,
    edgeCount,
    graphComplete,
    adjacency,
    summary: [
      `architecture-dependency-graph nodes=${nodeCount}`,
      `edges=${edgeCount}`,
      `complete=${graphComplete}`,
    ].join(" "),
  };
}

export function getDownstreamArcDefRefs(arcDefRef: string): string[] {
  return buildDeclarativeArchitectureAdjacencyList()[arcDefRef] ?? [];
}

export function buildArchitectureDependencyReport(input?: {
  deploymentId?: string;
  signals?: ArchitectureDependencySignals;
}): ArchitectureDependencyReport {
  const deploymentId = input?.deploymentId ?? "v69-architecture-dependency-default";

  const architectureCatalog = buildArchitectureCatalogReport({ deploymentId });
  const dependencyKinds = buildArchitectureDependencyKindManifest();
  const dependencyStrengths = buildArchitectureDependencyStrengthManifest();
  const dependencyBoundaries = buildArchitectureDependencyBoundaryManifest();
  const dependencyEdges = buildArchitectureDependencyEdgeManifest();
  const graph = buildArchitectureDependencyGraphManifest();
  const registry = buildArchitectureDependencyRegistry();
  const refsAligned = isArchitectureDependencyRefsAligned();
  const freezeLockIntact =
    isArchitectureDependencyFreezeLockIntact() &&
    architectureDependencyFreezeLockMatchesExpected();

  const signals: ArchitectureDependencySignals = {
    ...DEFAULT_SIGNALS,
    architectureCatalogReady: architectureCatalog.catalogReady,
    kindCatalogComplete: dependencyKinds.catalogComplete,
    strengthCatalogComplete: dependencyStrengths.catalogComplete,
    boundaryCatalogComplete: dependencyBoundaries.catalogComplete,
    edgeCatalogComplete: dependencyEdges.catalogComplete,
    refsAligned,
    graphBuildComplete: graph.graphComplete,
    freezeLockIntact,
    ...input?.signals,
  };

  const dependencyReady =
    architectureCatalog.catalogReady &&
    dependencyKinds.catalogComplete &&
    dependencyStrengths.catalogComplete &&
    dependencyBoundaries.catalogComplete &&
    dependencyEdges.catalogComplete &&
    graph.graphComplete &&
    registry.registryComplete &&
    refsAligned &&
    freezeLockIntact &&
    signals.architectureCatalogReady !== false;

  return {
    version: V69_ARCHITECTURE_DEPENDENCY_VERSION,
    reportId: `architecture-dependency-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    architectureCatalogVersion: V69_ARCHITECTURE_CATALOG_VERSION,
    architectureCatalogReady: architectureCatalog.catalogReady,
    dependencyKinds,
    dependencyStrengths,
    dependencyBoundaries,
    dependencyEdges,
    graph,
    registry,
    dependencyReady,
    readinessScore: dependencyReady ? 100 : 0,
    summary: [
      `architecture-dependency ready=${dependencyReady}`,
      `kinds=${dependencyKinds.kindCount}`,
      `strengths=${dependencyStrengths.strengthCount}`,
      `boundaries=${dependencyBoundaries.boundaryCount}`,
      `edges=${dependencyEdges.edgeCount}`,
      `nodes=${graph.nodeCount}`,
      `refsAligned=${refsAligned}`,
      `catalog=${architectureCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertArchitectureDependencyPass(
  report: ArchitectureDependencyReport,
): asserts report is ArchitectureDependencyReport & { dependencyReady: true } {
  if (!report.dependencyReady) {
    throw new Error(`V69 architecture dependency not ready: ${report.summary}`);
  }
}
