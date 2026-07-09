/**
 * V79 P7 — Task compliance catalog builder (read-only)
 */
import { buildTaskSimulationCatalog } from "./task.simulation.builder";
import { V79_TASK_SIMULATION_VERSION } from "./task.simulation";
import {
  buildTaskComplianceCatalogManifest,
  buildTaskComplianceValidationManifest,
  isTaskComplianceCatalogRefsAligned,
} from "./task.compliance.catalog";
import type { TaskComplianceCatalogReport, TaskComplianceCatalogSignals } from "./task.compliance";
import { V79_TASK_COMPLIANCE_FREEZE_VERSION, V79_TASK_COMPLIANCE_VERSION } from "./task.compliance";

const DEFAULT_SIGNALS: TaskComplianceCatalogSignals = {
  taskSimulationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildTaskComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: TaskComplianceCatalogSignals;
}): TaskComplianceCatalogReport {
  const deploymentId = input?.deploymentId ?? "v79-task-compliance-catalog-default";

  const taskSimulationCatalog = buildTaskSimulationCatalog({ deploymentId });
  const catalog = buildTaskComplianceCatalogManifest();
  const validations = buildTaskComplianceValidationManifest();
  const refsAligned = isTaskComplianceCatalogRefsAligned();

  const signals: TaskComplianceCatalogSignals = {
    ...DEFAULT_SIGNALS,
    taskSimulationCatalogReady: taskSimulationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V79_TASK_COMPLIANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    taskSimulationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.taskSimulationCatalogReady !== false;

  return {
    version: V79_TASK_COMPLIANCE_VERSION,
    freezeVersion: V79_TASK_COMPLIANCE_FREEZE_VERSION,
    reportId: `task-compliance-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    taskSimulationCatalogVersion: V79_TASK_SIMULATION_VERSION,
    taskSimulationCatalogReady: taskSimulationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `task-compliance-catalog ready=${catalogReady}`,
      `items=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `simulationCatalog=${taskSimulationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertTaskComplianceCatalogPass(
  report: TaskComplianceCatalogReport,
): asserts report is TaskComplianceCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V79 task compliance catalog not ready: ${report.summary}`);
  }
}
