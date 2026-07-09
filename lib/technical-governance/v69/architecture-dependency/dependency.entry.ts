/**
 * V69 P2 — Architecture dependency entry (read-only)
 */
import { buildArchitectureDependencyReport } from "./dependency.builder";
import type {
  ArchitectureDependencyReport,
  ArchitectureDependencySignals,
} from "./dependency.types";

export type { ArchitectureDependencySignals };

export function runArchitectureDependency(input?: {
  deploymentId?: string;
  signals?: ArchitectureDependencySignals;
}): ArchitectureDependencyReport {
  return buildArchitectureDependencyReport(input);
}

export function formatArchitectureDependencySummary(
  report: ArchitectureDependencyReport,
): string {
  const lines = [
    "V69 Architecture Dependency",
    `  ready: ${report.dependencyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  architecture-catalog: ${report.architectureCatalogVersion} (ready=${report.architectureCatalogReady})`,
    `  kinds: ${report.dependencyKinds.kindCount}`,
    `  strengths: ${report.dependencyStrengths.strengthCount}`,
    `  boundaries: ${report.dependencyBoundaries.boundaryCount}`,
    `  edges: ${report.dependencyEdges.edgeCount}`,
    `  graph nodes: ${report.graph.nodeCount}`,
    `  registry total: ${report.registry.totalEntries}`,
  ];
  return lines.join("\n");
}
