/**
 * V77 P7 — Planning compliance catalog entry (read-only)
 */
export {
  PLANNING_COMPLIANCE_CATALOG_ENTRIES,
  PLANNING_COMPLIANCE_VALIDATION_CATALOG,
  buildPlanningComplianceCatalogManifest,
  buildPlanningComplianceValidationManifest,
  computePlanningDeclarativeCompliancePass,
  getPlanningComplianceCatalogEntriesByKind,
  getPlanningComplianceCatalogEntryById,
  getPlanningComplianceValidationByComplianceRef,
  isPlanningComplianceCatalogRefsAligned,
} from "./planning.compliance.catalog";
export {
  assertPlanningComplianceCatalogPass,
  buildPlanningComplianceCatalog,
} from "./planning.compliance.builder";
export {
  V77_PLANNING_COMPLIANCE_FREEZE_VERSION,
  V77_PLANNING_COMPLIANCE_VERSION,
} from "./planning.compliance";
export type {
  PlanningComplianceCatalogEntry,
  PlanningComplianceCatalogReport,
  PlanningComplianceCatalogSignals,
  PlanningComplianceKind,
  PlanningComplianceStatus,
  PlanningComplianceValidation,
} from "./planning.compliance";

import { buildPlanningComplianceCatalog } from "./planning.compliance.builder";
import type {
  PlanningComplianceCatalogReport,
  PlanningComplianceCatalogSignals,
} from "./planning.compliance";

export function runPlanningComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningComplianceCatalogSignals;
}): PlanningComplianceCatalogReport {
  return buildPlanningComplianceCatalog(input);
}

export function formatPlanningComplianceCatalogSummary(
  report: PlanningComplianceCatalogReport,
): string {
  const passed = report.catalog.items.filter(
    (i) => i.status === "passed" || i.status === "waived",
  ).length;
  const lines = [
    "V77 Planning Compliance Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  planning-simulation-catalog: ${report.planningSimulationCatalogVersion} (ready=${report.planningSimulationCatalogReady})`,
    `  items: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  passed: ${passed}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
