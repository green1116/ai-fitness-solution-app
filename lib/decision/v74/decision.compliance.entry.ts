/**
 * V74 P7 — Decision compliance catalog entry (read-only)
 */
export {
  COMPLIANCE_CATALOG_ENTRIES,
  COMPLIANCE_VALIDATION_CATALOG,
  buildComplianceCatalogManifest,
  buildComplianceValidationManifest,
  computeDeclarativeCompliancePass,
  getComplianceCatalogEntriesByDomain,
  getComplianceCatalogEntryById,
  getComplianceValidationByComplianceRef,
  isDecisionComplianceCatalogRefsAligned,
} from "./decision.compliance.catalog";
export {
  assertDecisionComplianceCatalogPass,
  buildDecisionComplianceCatalog,
} from "./decision.compliance.builder";
export {
  V74_DECISION_COMPLIANCE_FREEZE_VERSION,
  V74_DECISION_COMPLIANCE_VERSION,
} from "./decision.compliance";
export type {
  ComplianceCatalogEntry,
  ComplianceDomainKind,
  ComplianceStatus,
  ComplianceValidation,
  DecisionComplianceCatalogReport,
  DecisionComplianceCatalogSignals,
} from "./decision.compliance";

import { buildDecisionComplianceCatalog } from "./decision.compliance.builder";
import type {
  DecisionComplianceCatalogReport,
  DecisionComplianceCatalogSignals,
} from "./decision.compliance";

export function runDecisionComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionComplianceCatalogSignals;
}): DecisionComplianceCatalogReport {
  return buildDecisionComplianceCatalog(input);
}

export function formatDecisionComplianceCatalogSummary(
  report: DecisionComplianceCatalogReport,
): string {
  const passed = report.catalog.items.filter(
    (i) => i.status === "passed" || i.status === "waived",
  ).length;
  const lines = [
    "V74 Decision Compliance Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  decision-simulation-catalog: ${report.decisionSimulationCatalogVersion} (ready=${report.decisionSimulationCatalogReady})`,
    `  items: ${report.catalog.entryCount}`,
    `  domains: ${report.catalog.domainCount}`,
    `  passed: ${passed}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
