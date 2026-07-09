/**
 * V79 P3 — Task context catalog builder (read-only)
 */
import { buildTaskPolicyCatalog } from "./task.policy.builder";
import { V79_TASK_POLICY_VERSION } from "./task.policy";
import {
  buildTaskContextCatalogManifest,
  buildTaskContextValidationManifest,
  isTaskContextCatalogRefsAligned,
} from "./task.context.catalog";
import type { TaskContextCatalogReport, TaskContextCatalogSignals } from "./task.context";
import { V79_TASK_CONTEXT_FREEZE_VERSION, V79_TASK_CONTEXT_VERSION } from "./task.context";

const DEFAULT_SIGNALS: TaskContextCatalogSignals = {
  taskPolicyCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildTaskContextCatalog(input?: {
  deploymentId?: string;
  signals?: TaskContextCatalogSignals;
}): TaskContextCatalogReport {
  const deploymentId = input?.deploymentId ?? "v79-task-context-catalog-default";

  const taskPolicyCatalog = buildTaskPolicyCatalog({ deploymentId });
  const catalog = buildTaskContextCatalogManifest();
  const validations = buildTaskContextValidationManifest();
  const refsAligned = isTaskContextCatalogRefsAligned();

  const signals: TaskContextCatalogSignals = {
    ...DEFAULT_SIGNALS,
    taskPolicyCatalogReady: taskPolicyCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V79_TASK_CONTEXT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    taskPolicyCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.taskPolicyCatalogReady !== false;

  return {
    version: V79_TASK_CONTEXT_VERSION,
    freezeVersion: V79_TASK_CONTEXT_FREEZE_VERSION,
    reportId: `task-context-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    taskPolicyCatalogVersion: V79_TASK_POLICY_VERSION,
    taskPolicyCatalogReady: taskPolicyCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `task-context-catalog ready=${catalogReady}`,
      `contexts=${catalog.entryCount}`,
      `domains=${catalog.domainCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `policyCatalog=${taskPolicyCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertTaskContextCatalogPass(
  report: TaskContextCatalogReport,
): asserts report is TaskContextCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V79 task context catalog not ready: ${report.summary}`);
  }
}
