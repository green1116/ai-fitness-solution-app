/**
 * V72 P2 — Signal dependency entry (read-only)
 */
export {
  SIGNAL_DEPENDENCY_CATALOG,
  SIGNAL_NODE_CATALOG,
  buildDeclarativeSignalAdjacency,
  buildDependencyManifest,
  buildSignalDependencyGraph,
  buildSignalNodeManifest,
  computeCycleCheck,
  computeDeclarativeImpactScore,
  getDependenciesByImpact,
  getDependencyById,
  getDownstreamNodes,
  getSignalNodeById,
  getUpstreamNodes,
  isSignalDependencyRefsAligned,
} from "./dependency.graph";
export { assertSignalDependencyPass, buildSignalDependency } from "./dependency.builder";
export {
  V72_SIGNAL_DEPENDENCY_FREEZE_VERSION,
  V72_SIGNAL_DEPENDENCY_VERSION,
} from "./signal.dependency";
export type {
  CycleCheck,
  Dependency,
  SignalDependencyGraph,
  SignalDependencyReport,
  SignalDependencySignals,
  SignalImpact,
  SignalNode,
} from "./signal.dependency";

import { buildSignalDependency } from "./dependency.builder";
import type { SignalDependencyReport, SignalDependencySignals } from "./signal.dependency";

export function runSignalDependency(input?: {
  deploymentId?: string;
  signals?: SignalDependencySignals;
}): SignalDependencyReport {
  return buildSignalDependency(input);
}

export function formatSignalDependencySummary(report: SignalDependencyReport): string {
  const lines = [
    "V72 Signal Dependency",
    `  ready: ${report.dependencyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  intelligence-catalog: ${report.intelligenceCatalogVersion} (ready=${report.intelligenceCatalogReady})`,
    `  nodes: ${report.nodes.nodeCount}`,
    `  dependencies: ${report.dependencies.edgeCount}`,
    `  acyclic: ${report.graph.cycleCheck.acyclic}`,
  ];
  return lines.join("\n");
}
