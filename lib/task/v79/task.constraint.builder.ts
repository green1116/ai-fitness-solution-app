/**
 * V79 P4 — Task constraint catalog builder (read-only)
 */
import { buildTaskContextCatalog } from "./task.context.builder";
import { V79_TASK_CONTEXT_VERSION } from "./task.context";
import {
  buildTaskConstraintCatalogManifest,
  buildTaskConstraintValidationManifest,
  isTaskConstraintCatalogRefsAligned,
} from "./task.constraint.catalog";
import type { TaskConstraintCatalogReport, TaskConstraintCatalogSignals } from "./task.constraint";
import { V79_TASK_CONSTRAINT_FREEZE_VERSION, V79_TASK_CONSTRAINT_VERSION } from "./task.constraint";

const DEFAULT_SIGNALS: TaskConstraintCatalogSignals = {
  taskContextCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildTaskConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: TaskConstraintCatalogSignals;
}): TaskConstraintCatalogReport {
  const deploymentId = input?.deploymentId ?? "v79-task-constraint-catalog-default";

  const taskContextCatalog = buildTaskContextCatalog({ deploymentId });
  const catalog = buildTaskConstraintCatalogManifest();
  const validations = buildTaskConstraintValidationManifest();
  const refsAligned = isTaskConstraintCatalogRefsAligned();

  const signals: TaskConstraintCatalogSignals = {
    ...DEFAULT_SIGNALS,
    taskContextCatalogReady: taskContextCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V79_TASK_CONSTRAINT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    taskContextCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.taskContextCatalogReady !== false;

  return {
    version: V79_TASK_CONSTRAINT_VERSION,
    freezeVersion: V79_TASK_CONSTRAINT_FREEZE_VERSION,
    reportId: `task-constraint-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    taskContextCatalogVersion: V79_TASK_CONTEXT_VERSION,
    taskContextCatalogReady: taskContextCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `task-constraint-catalog ready=${catalogReady}`,
      `constraints=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `contextCatalog=${taskContextCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertTaskConstraintCatalogPass(
  report: TaskConstraintCatalogReport,
): asserts report is TaskConstraintCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V79 task constraint catalog not ready: ${report.summary}`);
  }
}
