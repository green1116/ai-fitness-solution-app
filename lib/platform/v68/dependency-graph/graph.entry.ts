/**
 * V68 P2 — Dependency graph entry (read-only)
 */
import { buildDependencyGraphReport } from "./graph.builder";
import type { DependencyGraphReport, DependencyGraphSignals } from "./graph.types";

export type { DependencyGraphSignals };

export function runDependencyGraph(input?: {
  deploymentId?: string;
  signals?: DependencyGraphSignals;
}): DependencyGraphReport {
  return buildDependencyGraphReport(input);
}

export function formatDependencyGraphSummary(report: DependencyGraphReport): string {
  const lines = [
    "V68 Dependency Graph",
    `  ready: ${report.graphReady}`,
    `  score: ${report.readinessScore}/100`,
    `  service-catalog: ${report.serviceCatalogVersion} (ready=${report.serviceCatalogReady})`,
    `  dependency types: ${report.dependencyTypes.typeCount}`,
    `  dependency edges: ${report.dependencyEdges.edgeCount}`,
    `  graph nodes: ${report.graph.nodeCount}`,
  ];
  return lines.join("\n");
}
