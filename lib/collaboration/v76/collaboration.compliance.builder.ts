/**
 * V76 P7 — Collaboration compliance catalog builder (read-only)
 */
import { buildCollaborationSimulationCatalog } from "./collaboration.simulation.builder";
import { V76_COLLABORATION_SIMULATION_VERSION } from "./collaboration.simulation";
import {
  buildCollaborationComplianceCatalogManifest,
  buildCollaborationComplianceValidationManifest,
  isCollaborationComplianceCatalogRefsAligned,
} from "./collaboration.compliance.catalog";
import type {
  CollaborationComplianceCatalogReport,
  CollaborationComplianceCatalogSignals,
} from "./collaboration.compliance";
import {
  V76_COLLABORATION_COMPLIANCE_FREEZE_VERSION,
  V76_COLLABORATION_COMPLIANCE_VERSION,
} from "./collaboration.compliance";

const DEFAULT_SIGNALS: CollaborationComplianceCatalogSignals = {
  collaborationSimulationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildCollaborationComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationComplianceCatalogSignals;
}): CollaborationComplianceCatalogReport {
  const deploymentId = input?.deploymentId ?? "v76-collaboration-compliance-catalog-default";

  const collaborationSimulationCatalog = buildCollaborationSimulationCatalog({ deploymentId });
  const catalog = buildCollaborationComplianceCatalogManifest();
  const validations = buildCollaborationComplianceValidationManifest();
  const refsAligned = isCollaborationComplianceCatalogRefsAligned();

  const signals: CollaborationComplianceCatalogSignals = {
    ...DEFAULT_SIGNALS,
    collaborationSimulationCatalogReady: collaborationSimulationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V76_COLLABORATION_COMPLIANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    collaborationSimulationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.collaborationSimulationCatalogReady !== false;

  return {
    version: V76_COLLABORATION_COMPLIANCE_VERSION,
    freezeVersion: V76_COLLABORATION_COMPLIANCE_FREEZE_VERSION,
    reportId: `collaboration-compliance-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    collaborationSimulationCatalogVersion: V76_COLLABORATION_SIMULATION_VERSION,
    collaborationSimulationCatalogReady: collaborationSimulationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `collaboration-compliance-catalog ready=${catalogReady}`,
      `items=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `simulationCatalog=${collaborationSimulationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertCollaborationComplianceCatalogPass(
  report: CollaborationComplianceCatalogReport,
): asserts report is CollaborationComplianceCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V76 collaboration compliance catalog not ready: ${report.summary}`);
  }
}
