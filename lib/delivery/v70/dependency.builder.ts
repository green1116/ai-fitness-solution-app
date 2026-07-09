/**
 * V70 P2 — Release dependency builder (read-only)
 */
import { buildReleaseCatalog } from "./release.builder";
import { V70_RELEASE_VERSION } from "./release.types";
import {
  buildDependencyManifest,
  buildReleaseDependencyGraph,
  buildReleaseNodeManifest,
  isReleaseDependencyRefsAligned,
} from "./dependency.graph";
import type { ReleaseDependencyReport, ReleaseDependencySignals } from "./release.dependency";
import {
  V70_RELEASE_DEPENDENCY_FREEZE_VERSION,
  V70_RELEASE_DEPENDENCY_VERSION,
} from "./release.dependency";

const DEFAULT_SIGNALS: ReleaseDependencySignals = {
  releaseCatalogReady: true,
  nodesComplete: true,
  dependenciesComplete: true,
  refsAligned: true,
  graphComplete: true,
  cycleCheckPass: true,
  freezeVersionDeclared: true,
};

export function buildReleaseDependency(input?: {
  deploymentId?: string;
  signals?: ReleaseDependencySignals;
}): ReleaseDependencyReport {
  const deploymentId = input?.deploymentId ?? "v70-release-dependency-default";

  const releaseCatalog = buildReleaseCatalog({ deploymentId });
  const nodes = buildReleaseNodeManifest();
  const dependencies = buildDependencyManifest();
  const graph = buildReleaseDependencyGraph();
  const refsAligned = isReleaseDependencyRefsAligned();

  const signals: ReleaseDependencySignals = {
    ...DEFAULT_SIGNALS,
    releaseCatalogReady: releaseCatalog.catalogReady,
    nodesComplete: nodes.catalogComplete,
    dependenciesComplete: dependencies.catalogComplete,
    refsAligned,
    graphComplete: graph.graphComplete,
    cycleCheckPass: graph.cycleCheck.acyclic,
    freezeVersionDeclared: V70_RELEASE_DEPENDENCY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const dependencyReady =
    releaseCatalog.catalogReady &&
    nodes.catalogComplete &&
    dependencies.catalogComplete &&
    graph.graphComplete &&
    refsAligned &&
    graph.cycleCheck.acyclic &&
    signals.releaseCatalogReady !== false &&
    signals.cycleCheckPass !== false;

  return {
    version: V70_RELEASE_DEPENDENCY_VERSION,
    freezeVersion: V70_RELEASE_DEPENDENCY_FREEZE_VERSION,
    reportId: `release-dependency-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    releaseCatalogVersion: V70_RELEASE_VERSION,
    releaseCatalogReady: releaseCatalog.catalogReady,
    nodes,
    dependencies,
    graph,
    dependencyReady,
    readinessScore: dependencyReady ? 100 : 0,
    summary: [
      `release-dependency ready=${dependencyReady}`,
      `nodes=${nodes.nodeCount}`,
      `edges=${dependencies.edgeCount}`,
      `acyclic=${graph.cycleCheck.acyclic}`,
      `refsAligned=${refsAligned}`,
      `catalog=${releaseCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertReleaseDependencyPass(
  report: ReleaseDependencyReport,
): asserts report is ReleaseDependencyReport & { dependencyReady: true } {
  if (!report.dependencyReady) {
    throw new Error(`V70 release dependency not ready: ${report.summary}`);
  }
}
