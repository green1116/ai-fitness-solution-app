/**
 * V78 P7 — Execution compliance catalog entry (read-only)
 */
export {
  EXECUTION_COMPLIANCE_CATALOG_ENTRIES,
  EXECUTION_COMPLIANCE_VALIDATION_CATALOG,
  buildExecutionComplianceCatalogManifest,
  buildExecutionComplianceValidationManifest,
  computeExecutionDeclarativeCompliancePass,
  getExecutionComplianceCatalogEntriesByKind,
  getExecutionComplianceCatalogEntryById,
  getExecutionComplianceValidationByComplianceRef,
  isExecutionComplianceCatalogRefsAligned,
} from "./execution.compliance.catalog";
export {
  assertExecutionComplianceCatalogPass,
  buildExecutionComplianceCatalog,
} from "./execution.compliance.builder";
export {
  V78_EXECUTION_COMPLIANCE_FREEZE_VERSION,
  V78_EXECUTION_COMPLIANCE_VERSION,
} from "./execution.compliance";
export type {
  ExecutionComplianceCatalogEntry,
  ExecutionComplianceCatalogReport,
  ExecutionComplianceCatalogSignals,
  ExecutionComplianceKind,
  ExecutionComplianceStatus,
  ExecutionComplianceValidation,
} from "./execution.compliance";

import { buildExecutionComplianceCatalog } from "./execution.compliance.builder";
import type {
  ExecutionComplianceCatalogReport,
  ExecutionComplianceCatalogSignals,
} from "./execution.compliance";

export function runExecutionComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionComplianceCatalogSignals;
}): ExecutionComplianceCatalogReport {
  return buildExecutionComplianceCatalog(input);
}

export function formatExecutionComplianceCatalogSummary(
  report: ExecutionComplianceCatalogReport,
): string {
  const passed = report.catalog.items.filter(
    (i) => i.status === "passed" || i.status === "waived",
  ).length;
  const lines = [
    "V78 Execution Compliance Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  execution-simulation-catalog: ${report.executionSimulationCatalogVersion} (ready=${report.executionSimulationCatalogReady})`,
    `  items: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  passed: ${passed}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
