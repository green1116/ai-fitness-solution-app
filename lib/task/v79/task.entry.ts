/**
 * V79 P1 — Task inventory entry (read-only)
 */
export {
  TASK_GOVERNANCE_CATALOG,
  TASK_ROLE_CATALOG,
  TASK_TOPOLOGY_CATALOG,
  assertTaskInventoryPass,
  buildTaskGovernanceManifest,
  buildTaskInventory,
  buildTaskInventoryManifest,
  buildTaskRoleManifest,
  buildTaskStateManifest,
  buildTaskTopologyManifest,
  getTaskGovernanceById,
  getTaskRoleById,
  getTaskRolesByKind,
  getTaskTopologyById,
  isTaskInventoryRefsAligned,
} from "./task.inventory";
export {
  TASK_UPSTREAM_DEPENDENCIES,
  getTaskDependenciesByRef,
  getTaskDependencyById,
  isTaskUpstreamAligned,
} from "./task.dependencies";
export {
  TASK_SCOPE_CATALOG,
  buildTaskScopeManifest,
  getTaskScopeById,
  getTaskScopesByKind,
  isTaskScopeCoverageComplete,
} from "./task.scope";
export {
  TASK_STATE_CATALOG,
  getTaskStateById,
  getTaskStatesByKind,
  isTaskStateCoverageComplete,
} from "./task.state";
export { V79_TASK_FREEZE_VERSION, V79_TASK_VERSION } from "./task.types";
export type {
  TaskAssetStatus,
  TaskGovernance,
  TaskInventoryManifest,
  TaskInventoryReport,
  TaskInventorySignals,
  TaskRole,
  TaskRoleKind,
  TaskState,
  TaskStateKind,
  TaskTopology,
  TaskTopologyKind,
} from "./task.types";
export type { TaskUpstreamDependency } from "./task.dependencies";
export type { TaskScope, TaskScopeKind } from "./task.scope";

import { buildTaskInventory } from "./task.inventory";
import type { TaskInventoryReport, TaskInventorySignals } from "./task.types";

export function runTaskInventory(input?: {
  deploymentId?: string;
  signals?: TaskInventorySignals;
}): TaskInventoryReport {
  return buildTaskInventory(input);
}

export function formatTaskInventorySummary(report: TaskInventoryReport): string {
  const lines = [
    "V79 Task Inventory",
    `  ready: ${report.inventoryReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  upstream-execution-freeze: ${report.upstreamExecutionFreeze}`,
    `  upstream-execution-signoff: ${report.upstreamExecutionSignoff}`,
    `  roles: ${report.manifest.roles.entryCount}`,
    `  states: ${report.manifest.states.entryCount}`,
    `  topology: ${report.manifest.topology.entryCount}`,
    `  governance: ${report.manifest.governance.entryCount}`,
  ];
  return lines.join("\n");
}
