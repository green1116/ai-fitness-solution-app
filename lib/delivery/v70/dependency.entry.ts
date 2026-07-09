/**
 * V70 P2 — Release dependency entry (read-only)
 */
export {
  RELEASE_DEPENDENCY_CATALOG,
  RELEASE_NODE_CATALOG,
  buildDeclarativeReleaseAdjacency,
  buildDependencyManifest,
  buildReleaseDependencyGraph,
  buildReleaseNodeManifest,
  computeCycleCheck,
  computeDeclarativeImpactScore,
  getDependenciesByImpact,
  getDependencyById,
  getDownstreamNodes,
  getReleaseNodeById,
  getUpstreamNodes,
  isReleaseDependencyRefsAligned,
} from "./dependency.graph";
export { assertReleaseDependencyPass, buildReleaseDependency } from "./dependency.builder";
export {
  V70_RELEASE_DEPENDENCY_FREEZE_VERSION,
  V70_RELEASE_DEPENDENCY_VERSION,
} from "./release.dependency";
export type {
  CycleCheck,
  Dependency,
  ReleaseDependencyGraph,
  ReleaseDependencyReport,
  ReleaseDependencySignals,
  ReleaseImpact,
  ReleaseNode,
} from "./release.dependency";

import { buildReleaseDependency } from "./dependency.builder";
import type { ReleaseDependencyReport, ReleaseDependencySignals } from "./release.dependency";

export function runReleaseDependency(input?: {
  deploymentId?: string;
  signals?: ReleaseDependencySignals;
}): ReleaseDependencyReport {
  return buildReleaseDependency(input);
}

export function formatReleaseDependencySummary(report: ReleaseDependencyReport): string {
  const lines = [
    "V70 Release Dependency",
    `  ready: ${report.dependencyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  release-catalog: ${report.releaseCatalogVersion} (ready=${report.releaseCatalogReady})`,
    `  nodes: ${report.nodes.nodeCount}`,
    `  dependencies: ${report.dependencies.edgeCount}`,
    `  acyclic: ${report.graph.cycleCheck.acyclic}`,
  ];
  return lines.join("\n");
}
