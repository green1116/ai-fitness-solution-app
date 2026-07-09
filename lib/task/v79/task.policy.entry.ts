/**
 * V79 P2 — Task policy catalog entry (read-only)
 */
export {
  TASK_POLICY_CATALOG_ENTRIES,
  TASK_POLICY_GATE_CATALOG,
  buildTaskPolicyCatalogManifest,
  buildTaskPolicyGateManifest,
  computeTaskDeclarativePolicyBlock,
  getTaskPolicyCatalogEntriesByKind,
  getTaskPolicyCatalogEntryById,
  getTaskPolicyGateByPolicyRef,
  isTaskPolicyCatalogRefsAligned,
} from "./task.policy.catalog";
export { assertTaskPolicyCatalogPass, buildTaskPolicyCatalog } from "./task.policy.builder";
export { V79_TASK_POLICY_FREEZE_VERSION, V79_TASK_POLICY_VERSION } from "./task.policy";
export type {
  TaskPolicyCatalogEntry,
  TaskPolicyCatalogKind,
  TaskPolicyCatalogReport,
  TaskPolicyCatalogSignals,
  TaskPolicyEnforcement,
  TaskPolicyGate,
} from "./task.policy";

import { buildTaskPolicyCatalog } from "./task.policy.builder";
import type { TaskPolicyCatalogReport, TaskPolicyCatalogSignals } from "./task.policy";

export function runTaskPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: TaskPolicyCatalogSignals;
}): TaskPolicyCatalogReport {
  return buildTaskPolicyCatalog(input);
}

export function formatTaskPolicyCatalogSummary(report: TaskPolicyCatalogReport): string {
  const lines = [
    "V79 Task Policy Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  task-inventory: ${report.taskInventoryVersion} (ready=${report.taskInventoryReady})`,
    `  policies: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  gates: ${report.gates.gateCount}`,
  ];
  return lines.join("\n");
}
