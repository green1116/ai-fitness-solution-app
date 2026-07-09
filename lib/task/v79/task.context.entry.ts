/**
 * V79 P3 — Task context catalog entry (read-only)
 */
export {
  TASK_CONTEXT_CATALOG_ENTRIES,
  TASK_CONTEXT_VALIDATION_CATALOG,
  buildTaskContextCatalogManifest,
  buildTaskContextValidationManifest,
  computeTaskDeclarativeContextValid,
  getTaskContextCatalogEntriesByDomain,
  getTaskContextCatalogEntryById,
  getTaskContextValidationByContextRef,
  isTaskContextCatalogRefsAligned,
} from "./task.context.catalog";
export { assertTaskContextCatalogPass, buildTaskContextCatalog } from "./task.context.builder";
export { V79_TASK_CONTEXT_FREEZE_VERSION, V79_TASK_CONTEXT_VERSION } from "./task.context";
export type {
  TaskContextCatalogEntry,
  TaskContextCatalogReport,
  TaskContextCatalogSignals,
  TaskContextDomainKind,
  TaskContextLifecycle,
  TaskContextPriority,
  TaskContextValidation,
} from "./task.context";

import { buildTaskContextCatalog } from "./task.context.builder";
import type { TaskContextCatalogReport, TaskContextCatalogSignals } from "./task.context";

export function runTaskContextCatalog(input?: {
  deploymentId?: string;
  signals?: TaskContextCatalogSignals;
}): TaskContextCatalogReport {
  return buildTaskContextCatalog(input);
}

export function formatTaskContextCatalogSummary(report: TaskContextCatalogReport): string {
  const lines = [
    "V79 Task Context Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  task-policy-catalog: ${report.taskPolicyCatalogVersion} (ready=${report.taskPolicyCatalogReady})`,
    `  contexts: ${report.catalog.entryCount}`,
    `  domains: ${report.catalog.domainCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
