/**
 * V79 P7 — Task compliance catalog entry (read-only)
 */
export {
  TASK_COMPLIANCE_CATALOG_ENTRIES,
  TASK_COMPLIANCE_VALIDATION_CATALOG,
  buildTaskComplianceCatalogManifest,
  buildTaskComplianceValidationManifest,
  computeTaskDeclarativeCompliancePass,
  getTaskComplianceCatalogEntriesByKind,
  getTaskComplianceCatalogEntryById,
  getTaskComplianceValidationByComplianceRef,
  isTaskComplianceCatalogRefsAligned,
} from "./task.compliance.catalog";
export { assertTaskComplianceCatalogPass, buildTaskComplianceCatalog } from "./task.compliance.builder";
export { V79_TASK_COMPLIANCE_FREEZE_VERSION, V79_TASK_COMPLIANCE_VERSION } from "./task.compliance";
export type {
  TaskComplianceCatalogEntry,
  TaskComplianceCatalogReport,
  TaskComplianceCatalogSignals,
  TaskComplianceKind,
  TaskComplianceStatus,
  TaskComplianceValidation,
} from "./task.compliance";

import { buildTaskComplianceCatalog } from "./task.compliance.builder";
import type { TaskComplianceCatalogReport, TaskComplianceCatalogSignals } from "./task.compliance";

export function runTaskComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: TaskComplianceCatalogSignals;
}): TaskComplianceCatalogReport {
  return buildTaskComplianceCatalog(input);
}

export function formatTaskComplianceCatalogSummary(report: TaskComplianceCatalogReport): string {
  const passed = report.catalog.items.filter(
    (i) => i.status === "passed" || i.status === "waived",
  ).length;
  const lines = [
    "V79 Task Compliance Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  task-simulation-catalog: ${report.taskSimulationCatalogVersion} (ready=${report.taskSimulationCatalogReady})`,
    `  items: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  passed: ${passed}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
