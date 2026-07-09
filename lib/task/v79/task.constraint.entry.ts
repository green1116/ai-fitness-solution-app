/**
 * V79 P4 — Task constraint catalog entry (read-only)
 */
export {
  TASK_CONSTRAINT_CATALOG_ENTRIES,
  TASK_CONSTRAINT_VALIDATION_CATALOG,
  buildTaskConstraintCatalogManifest,
  buildTaskConstraintValidationManifest,
  computeTaskDeclarativeConstraintBlock,
  getTaskConstraintCatalogEntriesByKind,
  getTaskConstraintCatalogEntryById,
  getTaskConstraintValidationByConstraintRef,
  isTaskConstraintCatalogRefsAligned,
} from "./task.constraint.catalog";
export { assertTaskConstraintCatalogPass, buildTaskConstraintCatalog } from "./task.constraint.builder";
export { V79_TASK_CONSTRAINT_FREEZE_VERSION, V79_TASK_CONSTRAINT_VERSION } from "./task.constraint";
export type {
  TaskConstraintCatalogEntry,
  TaskConstraintCatalogReport,
  TaskConstraintCatalogSignals,
  TaskConstraintKind,
  TaskConstraintLevel,
  TaskConstraintPriority,
  TaskConstraintValidation,
} from "./task.constraint";

import { buildTaskConstraintCatalog } from "./task.constraint.builder";
import type { TaskConstraintCatalogReport, TaskConstraintCatalogSignals } from "./task.constraint";

export function runTaskConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: TaskConstraintCatalogSignals;
}): TaskConstraintCatalogReport {
  return buildTaskConstraintCatalog(input);
}

export function formatTaskConstraintCatalogSummary(report: TaskConstraintCatalogReport): string {
  const lines = [
    "V79 Task Constraint Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  task-context-catalog: ${report.taskContextCatalogVersion} (ready=${report.taskContextCatalogReady})`,
    `  constraints: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
