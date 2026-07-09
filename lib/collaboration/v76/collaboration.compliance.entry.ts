/**
 * V76 P7 — Collaboration compliance catalog entry (read-only)
 */
export {
  COLLABORATION_COMPLIANCE_CATALOG_ENTRIES,
  COLLABORATION_COMPLIANCE_VALIDATION_CATALOG,
  buildCollaborationComplianceCatalogManifest,
  buildCollaborationComplianceValidationManifest,
  computeCollaborationDeclarativeCompliancePass,
  getCollaborationComplianceCatalogEntriesByKind,
  getCollaborationComplianceCatalogEntryById,
  getCollaborationComplianceValidationByComplianceRef,
  isCollaborationComplianceCatalogRefsAligned,
} from "./collaboration.compliance.catalog";
export {
  assertCollaborationComplianceCatalogPass,
  buildCollaborationComplianceCatalog,
} from "./collaboration.compliance.builder";
export {
  V76_COLLABORATION_COMPLIANCE_FREEZE_VERSION,
  V76_COLLABORATION_COMPLIANCE_VERSION,
} from "./collaboration.compliance";
export type {
  CollaborationComplianceCatalogEntry,
  CollaborationComplianceCatalogReport,
  CollaborationComplianceCatalogSignals,
  CollaborationComplianceKind,
  CollaborationComplianceStatus,
  CollaborationComplianceValidation,
} from "./collaboration.compliance";

import { buildCollaborationComplianceCatalog } from "./collaboration.compliance.builder";
import type {
  CollaborationComplianceCatalogReport,
  CollaborationComplianceCatalogSignals,
} from "./collaboration.compliance";

export function runCollaborationComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationComplianceCatalogSignals;
}): CollaborationComplianceCatalogReport {
  return buildCollaborationComplianceCatalog(input);
}

export function formatCollaborationComplianceCatalogSummary(
  report: CollaborationComplianceCatalogReport,
): string {
  const passed = report.catalog.items.filter(
    (i) => i.status === "passed" || i.status === "waived",
  ).length;
  const lines = [
    "V76 Collaboration Compliance Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  collaboration-simulation-catalog: ${report.collaborationSimulationCatalogVersion} (ready=${report.collaborationSimulationCatalogReady})`,
    `  items: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  passed: ${passed}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
