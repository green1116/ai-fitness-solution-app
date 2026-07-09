/**
 * V79 P2 — Task policy catalog builder (read-only)
 */
import { buildTaskInventory } from "./task.inventory";
import { V79_TASK_VERSION } from "./task.types";
import {
  buildTaskPolicyCatalogManifest,
  buildTaskPolicyGateManifest,
  isTaskPolicyCatalogRefsAligned,
} from "./task.policy.catalog";
import type { TaskPolicyCatalogReport, TaskPolicyCatalogSignals } from "./task.policy";
import { V79_TASK_POLICY_FREEZE_VERSION, V79_TASK_POLICY_VERSION } from "./task.policy";

const DEFAULT_SIGNALS: TaskPolicyCatalogSignals = {
  taskInventoryReady: true,
  catalogComplete: true,
  gatesComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildTaskPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: TaskPolicyCatalogSignals;
}): TaskPolicyCatalogReport {
  const deploymentId = input?.deploymentId ?? "v79-task-policy-catalog-default";

  const taskInventory = buildTaskInventory({ deploymentId });
  const catalog = buildTaskPolicyCatalogManifest();
  const gates = buildTaskPolicyGateManifest();
  const refsAligned = isTaskPolicyCatalogRefsAligned();

  const signals: TaskPolicyCatalogSignals = {
    ...DEFAULT_SIGNALS,
    taskInventoryReady: taskInventory.inventoryReady,
    catalogComplete: catalog.catalogComplete,
    gatesComplete: gates.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V79_TASK_POLICY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    taskInventory.inventoryReady &&
    catalog.catalogComplete &&
    gates.catalogComplete &&
    refsAligned &&
    signals.taskInventoryReady !== false;

  return {
    version: V79_TASK_POLICY_VERSION,
    freezeVersion: V79_TASK_POLICY_FREEZE_VERSION,
    reportId: `task-policy-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    taskInventoryVersion: V79_TASK_VERSION,
    taskInventoryReady: taskInventory.inventoryReady,
    catalog,
    gates,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `task-policy-catalog ready=${catalogReady}`,
      `policies=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `gates=${gates.gateCount}`,
      `refsAligned=${refsAligned}`,
      `inventory=${taskInventory.inventoryReady}`,
    ].join(" "),
  };
}

export function assertTaskPolicyCatalogPass(
  report: TaskPolicyCatalogReport,
): asserts report is TaskPolicyCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V79 task policy catalog not ready: ${report.summary}`);
  }
}
