/**
 * V71 P2 — Workflow dependency entry (read-only)
 */
export {
  WORKFLOW_DEPENDENCY_CATALOG,
  WORKFLOW_NODE_CATALOG,
  buildDeclarativeWorkflowAdjacency,
  buildDependencyManifest,
  buildWorkflowDependencyGraph,
  buildWorkflowNodeManifest,
  computeCycleCheck,
  computeDeclarativeImpactScore,
  getDependenciesByImpact,
  getDependencyById,
  getDownstreamNodes,
  getUpstreamNodes,
  getWorkflowNodeById,
  isWorkflowDependencyRefsAligned,
} from "./dependency.graph";
export { assertWorkflowDependencyPass, buildWorkflowDependency } from "./dependency.builder";
export {
  V71_WORKFLOW_DEPENDENCY_FREEZE_VERSION,
  V71_WORKFLOW_DEPENDENCY_VERSION,
} from "./workflow.dependency";
export type {
  CycleCheck,
  Dependency,
  WorkflowDependencyGraph,
  WorkflowDependencyReport,
  WorkflowDependencySignals,
  WorkflowImpact,
  WorkflowNode,
} from "./workflow.dependency";

import { buildWorkflowDependency } from "./dependency.builder";
import type { WorkflowDependencyReport, WorkflowDependencySignals } from "./workflow.dependency";

export function runWorkflowDependency(input?: {
  deploymentId?: string;
  signals?: WorkflowDependencySignals;
}): WorkflowDependencyReport {
  return buildWorkflowDependency(input);
}

export function formatWorkflowDependencySummary(report: WorkflowDependencyReport): string {
  const lines = [
    "V71 Workflow Dependency",
    `  ready: ${report.dependencyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  orchestration-catalog: ${report.orchestrationCatalogVersion} (ready=${report.orchestrationCatalogReady})`,
    `  nodes: ${report.nodes.nodeCount}`,
    `  dependencies: ${report.dependencies.edgeCount}`,
    `  acyclic: ${report.graph.cycleCheck.acyclic}`,
  ];
  return lines.join("\n");
}
