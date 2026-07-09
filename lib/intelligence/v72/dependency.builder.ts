/**
 * V72 P2 — Signal dependency builder (read-only)
 */
import { buildIntelligenceCatalog } from "./intelligence.builder";
import { V72_INTELLIGENCE_VERSION } from "./intelligence.types";
import {
  buildDependencyManifest,
  buildSignalDependencyGraph,
  buildSignalNodeManifest,
  isSignalDependencyRefsAligned,
} from "./dependency.graph";
import type { SignalDependencyReport, SignalDependencySignals } from "./signal.dependency";
import {
  V72_SIGNAL_DEPENDENCY_FREEZE_VERSION,
  V72_SIGNAL_DEPENDENCY_VERSION,
} from "./signal.dependency";

const DEFAULT_SIGNALS: SignalDependencySignals = {
  intelligenceCatalogReady: true,
  nodesComplete: true,
  dependenciesComplete: true,
  refsAligned: true,
  graphComplete: true,
  cycleCheckPass: true,
  freezeVersionDeclared: true,
};

export function buildSignalDependency(input?: {
  deploymentId?: string;
  signals?: SignalDependencySignals;
}): SignalDependencyReport {
  const deploymentId = input?.deploymentId ?? "v72-signal-dependency-default";

  const intelligenceCatalog = buildIntelligenceCatalog({ deploymentId });
  const nodes = buildSignalNodeManifest();
  const dependencies = buildDependencyManifest();
  const graph = buildSignalDependencyGraph();
  const refsAligned = isSignalDependencyRefsAligned();

  const signals: SignalDependencySignals = {
    ...DEFAULT_SIGNALS,
    intelligenceCatalogReady: intelligenceCatalog.catalogReady,
    nodesComplete: nodes.catalogComplete,
    dependenciesComplete: dependencies.catalogComplete,
    refsAligned,
    graphComplete: graph.graphComplete,
    cycleCheckPass: graph.cycleCheck.acyclic,
    freezeVersionDeclared: V72_SIGNAL_DEPENDENCY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const dependencyReady =
    intelligenceCatalog.catalogReady &&
    nodes.catalogComplete &&
    dependencies.catalogComplete &&
    graph.graphComplete &&
    refsAligned &&
    graph.cycleCheck.acyclic &&
    signals.intelligenceCatalogReady !== false &&
    signals.cycleCheckPass !== false;

  return {
    version: V72_SIGNAL_DEPENDENCY_VERSION,
    freezeVersion: V72_SIGNAL_DEPENDENCY_FREEZE_VERSION,
    reportId: `signal-dependency-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    intelligenceCatalogVersion: V72_INTELLIGENCE_VERSION,
    intelligenceCatalogReady: intelligenceCatalog.catalogReady,
    nodes,
    dependencies,
    graph,
    dependencyReady,
    readinessScore: dependencyReady ? 100 : 0,
    summary: [
      `signal-dependency ready=${dependencyReady}`,
      `nodes=${nodes.nodeCount}`,
      `edges=${dependencies.edgeCount}`,
      `acyclic=${graph.cycleCheck.acyclic}`,
      `refsAligned=${refsAligned}`,
      `catalog=${intelligenceCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertSignalDependencyPass(
  report: SignalDependencyReport,
): asserts report is SignalDependencyReport & { dependencyReady: true } {
  if (!report.dependencyReady) {
    throw new Error(`V72 signal dependency not ready: ${report.summary}`);
  }
}
