/**
 * V79 P6 — Task simulation catalog builder (read-only)
 */
import { buildTaskEvaluationCatalog } from "./task.evaluation.builder";
import { V79_TASK_EVALUATION_VERSION } from "./task.evaluation";
import {
  buildTaskSimulationCatalogManifest,
  buildTaskSimulationValidationManifest,
  isTaskSimulationCatalogRefsAligned,
} from "./task.simulation.catalog";
import type { TaskSimulationCatalogReport, TaskSimulationCatalogSignals } from "./task.simulation";
import { V79_TASK_SIMULATION_FREEZE_VERSION, V79_TASK_SIMULATION_VERSION } from "./task.simulation";

const DEFAULT_SIGNALS: TaskSimulationCatalogSignals = {
  taskEvaluationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildTaskSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: TaskSimulationCatalogSignals;
}): TaskSimulationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v79-task-simulation-catalog-default";

  const taskEvaluationCatalog = buildTaskEvaluationCatalog({ deploymentId });
  const catalog = buildTaskSimulationCatalogManifest();
  const validations = buildTaskSimulationValidationManifest();
  const refsAligned = isTaskSimulationCatalogRefsAligned();

  const signals: TaskSimulationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    taskEvaluationCatalogReady: taskEvaluationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V79_TASK_SIMULATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    taskEvaluationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.taskEvaluationCatalogReady !== false;

  return {
    version: V79_TASK_SIMULATION_VERSION,
    freezeVersion: V79_TASK_SIMULATION_FREEZE_VERSION,
    reportId: `task-simulation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    taskEvaluationCatalogVersion: V79_TASK_EVALUATION_VERSION,
    taskEvaluationCatalogReady: taskEvaluationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `task-simulation-catalog ready=${catalogReady}`,
      `simulations=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `evaluationCatalog=${taskEvaluationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertTaskSimulationCatalogPass(
  report: TaskSimulationCatalogReport,
): asserts report is TaskSimulationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V79 task simulation catalog not ready: ${report.summary}`);
  }
}
