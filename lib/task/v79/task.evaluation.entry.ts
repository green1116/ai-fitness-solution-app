/**
 * V79 P5 — Task evaluation catalog entry (read-only)
 */
export {
  TASK_EVALUATION_CATALOG_ENTRIES,
  TASK_EVALUATION_VALIDATION_CATALOG,
  buildTaskEvaluationCatalogManifest,
  buildTaskEvaluationValidationManifest,
  computeTaskDeclarativeEvaluationDeclared,
  getTaskEvaluationCatalogEntriesByKind,
  getTaskEvaluationCatalogEntryById,
  getTaskEvaluationValidationByEvaluationRef,
  isTaskEvaluationCatalogRefsAligned,
} from "./task.evaluation.catalog";
export { assertTaskEvaluationCatalogPass, buildTaskEvaluationCatalog } from "./task.evaluation.builder";
export { V79_TASK_EVALUATION_FREEZE_VERSION, V79_TASK_EVALUATION_VERSION } from "./task.evaluation";
export type {
  TaskEvaluationCatalogEntry,
  TaskEvaluationCatalogReport,
  TaskEvaluationCatalogSignals,
  TaskEvaluationKind,
  TaskEvaluationPriority,
  TaskEvaluationValidation,
} from "./task.evaluation";

import { buildTaskEvaluationCatalog } from "./task.evaluation.builder";
import type { TaskEvaluationCatalogReport, TaskEvaluationCatalogSignals } from "./task.evaluation";

export function runTaskEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: TaskEvaluationCatalogSignals;
}): TaskEvaluationCatalogReport {
  return buildTaskEvaluationCatalog(input);
}

export function formatTaskEvaluationCatalogSummary(report: TaskEvaluationCatalogReport): string {
  const lines = [
    "V79 Task Evaluation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  task-constraint-catalog: ${report.taskConstraintCatalogVersion} (ready=${report.taskConstraintCatalogReady})`,
    `  evaluations: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
