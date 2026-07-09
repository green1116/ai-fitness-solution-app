/**
 * V79 P5 — Task evaluation catalog builder (read-only)
 */
import { buildTaskConstraintCatalog } from "./task.constraint.builder";
import { V79_TASK_CONSTRAINT_VERSION } from "./task.constraint";
import {
  buildTaskEvaluationCatalogManifest,
  buildTaskEvaluationValidationManifest,
  isTaskEvaluationCatalogRefsAligned,
} from "./task.evaluation.catalog";
import type { TaskEvaluationCatalogReport, TaskEvaluationCatalogSignals } from "./task.evaluation";
import { V79_TASK_EVALUATION_FREEZE_VERSION, V79_TASK_EVALUATION_VERSION } from "./task.evaluation";

const DEFAULT_SIGNALS: TaskEvaluationCatalogSignals = {
  taskConstraintCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildTaskEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: TaskEvaluationCatalogSignals;
}): TaskEvaluationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v79-task-evaluation-catalog-default";

  const taskConstraintCatalog = buildTaskConstraintCatalog({ deploymentId });
  const catalog = buildTaskEvaluationCatalogManifest();
  const validations = buildTaskEvaluationValidationManifest();
  const refsAligned = isTaskEvaluationCatalogRefsAligned();

  const signals: TaskEvaluationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    taskConstraintCatalogReady: taskConstraintCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V79_TASK_EVALUATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    taskConstraintCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.taskConstraintCatalogReady !== false;

  return {
    version: V79_TASK_EVALUATION_VERSION,
    freezeVersion: V79_TASK_EVALUATION_FREEZE_VERSION,
    reportId: `task-evaluation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    taskConstraintCatalogVersion: V79_TASK_CONSTRAINT_VERSION,
    taskConstraintCatalogReady: taskConstraintCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `task-evaluation-catalog ready=${catalogReady}`,
      `evaluations=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `constraintCatalog=${taskConstraintCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertTaskEvaluationCatalogPass(
  report: TaskEvaluationCatalogReport,
): asserts report is TaskEvaluationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V79 task evaluation catalog not ready: ${report.summary}`);
  }
}
