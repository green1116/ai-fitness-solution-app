/**
 * V73 P2 — Knowledge dependency entry (read-only)
 */
export {
  KNOWLEDGE_DEPENDENCY_CATALOG,
  KNOWLEDGE_NODE_CATALOG,
  buildDeclarativeKnowledgeAdjacency,
  buildDependencyManifest,
  buildKnowledgeDependencyGraph,
  buildKnowledgeNodeManifest,
  computeCycleCheck,
  computeDeclarativeImpactScore,
  getDependenciesByImpact,
  getDependencyById,
  getDownstreamNodes,
  getKnowledgeNodeById,
  getUpstreamNodes,
  isKnowledgeDependencyRefsAligned,
} from "./dependency.graph";
export { assertKnowledgeDependencyPass, buildKnowledgeDependency } from "./dependency.builder";
export {
  V73_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
  V73_KNOWLEDGE_DEPENDENCY_VERSION,
} from "./knowledge.dependency";
export type {
  CycleCheck,
  Dependency,
  KnowledgeDependencyGraph,
  KnowledgeDependencyReport,
  KnowledgeDependencySignals,
  KnowledgeImpact,
  KnowledgeNode,
} from "./knowledge.dependency";

import { buildKnowledgeDependency } from "./dependency.builder";
import type { KnowledgeDependencyReport, KnowledgeDependencySignals } from "./knowledge.dependency";

export function runKnowledgeDependency(input?: {
  deploymentId?: string;
  signals?: KnowledgeDependencySignals;
}): KnowledgeDependencyReport {
  return buildKnowledgeDependency(input);
}

export function formatKnowledgeDependencySummary(report: KnowledgeDependencyReport): string {
  const lines = [
    "V73 Knowledge Dependency",
    `  ready: ${report.dependencyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  knowledge-catalog: ${report.knowledgeCatalogVersion} (ready=${report.knowledgeCatalogReady})`,
    `  nodes: ${report.nodes.nodeCount}`,
    `  dependencies: ${report.dependencies.edgeCount}`,
    `  acyclic: ${report.graph.cycleCheck.acyclic}`,
  ];
  return lines.join("\n");
}
