/**
 * V68 P2 — Dependency graph builder (adjacency + report, read-only)
 */
import { buildServiceCatalogReport } from "../service-catalog/catalog.builder";
import { V68_SERVICE_CATALOG_VERSION } from "../service-catalog/catalog.types";
import { SERVICE_DEFINITION_CATALOG } from "../service-catalog/service.definition.catalog";

import { isDependencyGraphRefsAligned } from "./alignment.catalog";
import { buildDependencyEdgeManifest, DEPENDENCY_EDGE_CATALOG } from "./dependency.edge.catalog";
import { buildDependencyTypeManifest } from "./dependency.type.catalog";
import type {
  DependencyGraphManifest,
  DependencyGraphReport,
  DependencyGraphSignals,
  GraphAdjacencyList,
} from "./graph.types";
import { V68_DEPENDENCY_GRAPH_VERSION } from "./graph.types";

const DEFAULT_GRAPH_SIGNALS: DependencyGraphSignals = {
  serviceCatalogReady: true,
  typeCatalogComplete: true,
  edgeCatalogComplete: true,
  refsAligned: true,
  graphBuildComplete: true,
};

export function buildDeclarativeAdjacencyList(): GraphAdjacencyList {
  const adj: GraphAdjacencyList = {};

  for (const def of SERVICE_DEFINITION_CATALOG) {
    adj[def.id] = [];
  }

  for (const edge of DEPENDENCY_EDGE_CATALOG) {
    if (edge.direction === "outbound" || edge.direction === "bidirectional") {
      adj[edge.fromServiceRef] = [...(adj[edge.fromServiceRef] ?? []), edge.toServiceRef];
    }
    if (edge.direction === "inbound") {
      adj[edge.toServiceRef] = [...(adj[edge.toServiceRef] ?? []), edge.fromServiceRef];
    }
    if (edge.direction === "bidirectional") {
      adj[edge.toServiceRef] = [...(adj[edge.toServiceRef] ?? []), edge.fromServiceRef];
    }
  }

  return adj;
}

export function buildDependencyGraphManifest(): DependencyGraphManifest {
  const adjacency = buildDeclarativeAdjacencyList();
  const nodeCount = Object.keys(adjacency).length;
  const edgeCount = DEPENDENCY_EDGE_CATALOG.length;
  const graphComplete = nodeCount >= 6 && edgeCount >= 6;

  return {
    version: V68_DEPENDENCY_GRAPH_VERSION,
    nodeCount,
    edgeCount,
    graphComplete,
    adjacency,
    summary: [
      `dependency-graph nodes=${nodeCount}`,
      `edges=${edgeCount}`,
      `complete=${graphComplete}`,
    ].join(" "),
  };
}

export function getDownstreamRefs(serviceRef: string): string[] {
  return buildDeclarativeAdjacencyList()[serviceRef] ?? [];
}

export function buildDependencyGraphReport(input?: {
  deploymentId?: string;
  signals?: DependencyGraphSignals;
}): DependencyGraphReport {
  const deploymentId = input?.deploymentId ?? "v68-dependency-graph-default";

  const serviceCatalog = buildServiceCatalogReport({ deploymentId });
  const dependencyTypes = buildDependencyTypeManifest();
  const dependencyEdges = buildDependencyEdgeManifest();
  const graph = buildDependencyGraphManifest();
  const refsAligned = isDependencyGraphRefsAligned();

  const signals: DependencyGraphSignals = {
    ...DEFAULT_GRAPH_SIGNALS,
    serviceCatalogReady: serviceCatalog.catalogReady,
    typeCatalogComplete: dependencyTypes.catalogComplete,
    edgeCatalogComplete: dependencyEdges.catalogComplete,
    refsAligned,
    graphBuildComplete: graph.graphComplete,
    ...input?.signals,
  };

  const graphReady =
    serviceCatalog.catalogReady &&
    dependencyTypes.catalogComplete &&
    dependencyEdges.catalogComplete &&
    graph.graphComplete &&
    refsAligned &&
    signals.serviceCatalogReady !== false;

  return {
    version: V68_DEPENDENCY_GRAPH_VERSION,
    reportId: `dependency-graph-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    serviceCatalogVersion: V68_SERVICE_CATALOG_VERSION,
    serviceCatalogReady: serviceCatalog.catalogReady,
    dependencyTypes,
    dependencyEdges,
    graph,
    graphReady,
    readinessScore: graphReady ? 100 : 0,
    summary: [
      `dependency-graph ready=${graphReady}`,
      `types=${dependencyTypes.typeCount}`,
      `edges=${dependencyEdges.edgeCount}`,
      `nodes=${graph.nodeCount}`,
      `refsAligned=${refsAligned}`,
      `catalog=${serviceCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertDependencyGraphPass(
  report: DependencyGraphReport,
): asserts report is DependencyGraphReport & { graphReady: true } {
  if (!report.graphReady) {
    throw new Error(`V68 dependency graph not ready: ${report.summary}`);
  }
}
