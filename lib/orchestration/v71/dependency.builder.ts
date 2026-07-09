/**
 * V71 P2 — Workflow dependency builder (read-only)
 */
import { buildOrchestrationCatalog } from "./orchestration.builder";
import { V71_ORCHESTRATION_VERSION } from "./orchestration.types";
import {
  buildDependencyManifest,
  buildWorkflowDependencyGraph,
  buildWorkflowNodeManifest,
  isWorkflowDependencyRefsAligned,
} from "./dependency.graph";
import type { WorkflowDependencyReport, WorkflowDependencySignals } from "./workflow.dependency";
import {
  V71_WORKFLOW_DEPENDENCY_FREEZE_VERSION,
  V71_WORKFLOW_DEPENDENCY_VERSION,
} from "./workflow.dependency";

const DEFAULT_SIGNALS: WorkflowDependencySignals = {
  orchestrationCatalogReady: true,
  nodesComplete: true,
  dependenciesComplete: true,
  refsAligned: true,
  graphComplete: true,
  cycleCheckPass: true,
  freezeVersionDeclared: true,
};

export function buildWorkflowDependency(input?: {
  deploymentId?: string;
  signals?: WorkflowDependencySignals;
}): WorkflowDependencyReport {
  const deploymentId = input?.deploymentId ?? "v71-workflow-dependency-default";

  const orchestrationCatalog = buildOrchestrationCatalog({ deploymentId });
  const nodes = buildWorkflowNodeManifest();
  const dependencies = buildDependencyManifest();
  const graph = buildWorkflowDependencyGraph();
  const refsAligned = isWorkflowDependencyRefsAligned();

  const signals: WorkflowDependencySignals = {
    ...DEFAULT_SIGNALS,
    orchestrationCatalogReady: orchestrationCatalog.catalogReady,
    nodesComplete: nodes.catalogComplete,
    dependenciesComplete: dependencies.catalogComplete,
    refsAligned,
    graphComplete: graph.graphComplete,
    cycleCheckPass: graph.cycleCheck.acyclic,
    freezeVersionDeclared: V71_WORKFLOW_DEPENDENCY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const dependencyReady =
    orchestrationCatalog.catalogReady &&
    nodes.catalogComplete &&
    dependencies.catalogComplete &&
    graph.graphComplete &&
    refsAligned &&
    graph.cycleCheck.acyclic &&
    signals.orchestrationCatalogReady !== false &&
    signals.cycleCheckPass !== false;

  return {
    version: V71_WORKFLOW_DEPENDENCY_VERSION,
    freezeVersion: V71_WORKFLOW_DEPENDENCY_FREEZE_VERSION,
    reportId: `workflow-dependency-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    orchestrationCatalogVersion: V71_ORCHESTRATION_VERSION,
    orchestrationCatalogReady: orchestrationCatalog.catalogReady,
    nodes,
    dependencies,
    graph,
    dependencyReady,
    readinessScore: dependencyReady ? 100 : 0,
    summary: [
      `workflow-dependency ready=${dependencyReady}`,
      `nodes=${nodes.nodeCount}`,
      `edges=${dependencies.edgeCount}`,
      `acyclic=${graph.cycleCheck.acyclic}`,
      `refsAligned=${refsAligned}`,
      `catalog=${orchestrationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertWorkflowDependencyPass(
  report: WorkflowDependencyReport,
): asserts report is WorkflowDependencyReport & { dependencyReady: true } {
  if (!report.dependencyReady) {
    throw new Error(`V71 workflow dependency not ready: ${report.summary}`);
  }
}
