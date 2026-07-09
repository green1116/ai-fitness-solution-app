/**
 * V73 P2 — Knowledge dependency builder (read-only)
 */
import { buildKnowledgeCatalog } from "./knowledge.builder";
import { V73_KNOWLEDGE_VERSION } from "./knowledge.types";
import {
  buildDependencyManifest,
  buildKnowledgeDependencyGraph,
  buildKnowledgeNodeManifest,
  isKnowledgeDependencyRefsAligned,
} from "./dependency.graph";
import type { KnowledgeDependencyReport, KnowledgeDependencySignals } from "./knowledge.dependency";
import {
  V73_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
  V73_KNOWLEDGE_DEPENDENCY_VERSION,
} from "./knowledge.dependency";

const DEFAULT_SIGNALS: KnowledgeDependencySignals = {
  knowledgeCatalogReady: true,
  nodesComplete: true,
  dependenciesComplete: true,
  refsAligned: true,
  graphComplete: true,
  cycleCheckPass: true,
  freezeVersionDeclared: true,
};

export function buildKnowledgeDependency(input?: {
  deploymentId?: string;
  signals?: KnowledgeDependencySignals;
}): KnowledgeDependencyReport {
  const deploymentId = input?.deploymentId ?? "v73-knowledge-dependency-default";

  const knowledgeCatalog = buildKnowledgeCatalog({ deploymentId });
  const nodes = buildKnowledgeNodeManifest();
  const dependencies = buildDependencyManifest();
  const graph = buildKnowledgeDependencyGraph();
  const refsAligned = isKnowledgeDependencyRefsAligned();

  const signals: KnowledgeDependencySignals = {
    ...DEFAULT_SIGNALS,
    knowledgeCatalogReady: knowledgeCatalog.catalogReady,
    nodesComplete: nodes.catalogComplete,
    dependenciesComplete: dependencies.catalogComplete,
    refsAligned,
    graphComplete: graph.graphComplete,
    cycleCheckPass: graph.cycleCheck.acyclic,
    freezeVersionDeclared: V73_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const dependencyReady =
    knowledgeCatalog.catalogReady &&
    nodes.catalogComplete &&
    dependencies.catalogComplete &&
    graph.graphComplete &&
    refsAligned &&
    graph.cycleCheck.acyclic &&
    signals.knowledgeCatalogReady !== false &&
    signals.cycleCheckPass !== false;

  return {
    version: V73_KNOWLEDGE_DEPENDENCY_VERSION,
    freezeVersion: V73_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
    reportId: `knowledge-dependency-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    knowledgeCatalogVersion: V73_KNOWLEDGE_VERSION,
    knowledgeCatalogReady: knowledgeCatalog.catalogReady,
    nodes,
    dependencies,
    graph,
    dependencyReady,
    readinessScore: dependencyReady ? 100 : 0,
    summary: [
      `knowledge-dependency ready=${dependencyReady}`,
      `nodes=${nodes.nodeCount}`,
      `edges=${dependencies.edgeCount}`,
      `acyclic=${graph.cycleCheck.acyclic}`,
      `refsAligned=${refsAligned}`,
      `catalog=${knowledgeCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertKnowledgeDependencyPass(
  report: KnowledgeDependencyReport,
): asserts report is KnowledgeDependencyReport & { dependencyReady: true } {
  if (!report.dependencyReady) {
    throw new Error(`V73 knowledge dependency not ready: ${report.summary}`);
  }
}
