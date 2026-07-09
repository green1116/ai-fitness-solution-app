/**
 * V79 P6 — Task simulation catalog entry (read-only)
 */
export {
  TASK_SIMULATION_CATALOG_ENTRIES,
  TASK_SIMULATION_VALIDATION_CATALOG,
  buildTaskSimulationCatalogManifest,
  buildTaskSimulationValidationManifest,
  computeTaskDeclarativeSimulationDeclared,
  getTaskSimulationCatalogEntriesByKind,
  getTaskSimulationCatalogEntryById,
  getTaskSimulationValidationBySimulationRef,
  isTaskSimulationCatalogRefsAligned,
} from "./task.simulation.catalog";
export { assertTaskSimulationCatalogPass, buildTaskSimulationCatalog } from "./task.simulation.builder";
export { V79_TASK_SIMULATION_FREEZE_VERSION, V79_TASK_SIMULATION_VERSION } from "./task.simulation";
export type {
  TaskSimulationCatalogEntry,
  TaskSimulationCatalogReport,
  TaskSimulationCatalogSignals,
  TaskSimulationKind,
  TaskSimulationPriority,
  TaskSimulationValidation,
} from "./task.simulation";

import { buildTaskSimulationCatalog } from "./task.simulation.builder";
import type { TaskSimulationCatalogReport, TaskSimulationCatalogSignals } from "./task.simulation";

export function runTaskSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: TaskSimulationCatalogSignals;
}): TaskSimulationCatalogReport {
  return buildTaskSimulationCatalog(input);
}

export function formatTaskSimulationCatalogSummary(report: TaskSimulationCatalogReport): string {
  const lines = [
    "V79 Task Simulation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  task-evaluation-catalog: ${report.taskEvaluationCatalogVersion} (ready=${report.taskEvaluationCatalogReady})`,
    `  simulations: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
