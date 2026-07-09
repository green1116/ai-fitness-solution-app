/**
 * V74 P7 — Decision compliance catalog builder (read-only)
 */
import { buildDecisionSimulationCatalog } from "./decision.simulation.builder";
import { V74_DECISION_SIMULATION_VERSION } from "./decision.simulation";
import {
  buildComplianceCatalogManifest,
  buildComplianceValidationManifest,
  isDecisionComplianceCatalogRefsAligned,
} from "./decision.compliance.catalog";
import type {
  DecisionComplianceCatalogReport,
  DecisionComplianceCatalogSignals,
} from "./decision.compliance";
import {
  V74_DECISION_COMPLIANCE_FREEZE_VERSION,
  V74_DECISION_COMPLIANCE_VERSION,
} from "./decision.compliance";

const DEFAULT_SIGNALS: DecisionComplianceCatalogSignals = {
  decisionSimulationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildDecisionComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionComplianceCatalogSignals;
}): DecisionComplianceCatalogReport {
  const deploymentId = input?.deploymentId ?? "v74-decision-compliance-catalog-default";

  const decisionSimulationCatalog = buildDecisionSimulationCatalog({ deploymentId });
  const catalog = buildComplianceCatalogManifest();
  const validations = buildComplianceValidationManifest();
  const refsAligned = isDecisionComplianceCatalogRefsAligned();

  const signals: DecisionComplianceCatalogSignals = {
    ...DEFAULT_SIGNALS,
    decisionSimulationCatalogReady: decisionSimulationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V74_DECISION_COMPLIANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    decisionSimulationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.decisionSimulationCatalogReady !== false;

  return {
    version: V74_DECISION_COMPLIANCE_VERSION,
    freezeVersion: V74_DECISION_COMPLIANCE_FREEZE_VERSION,
    reportId: `decision-compliance-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    decisionSimulationCatalogVersion: V74_DECISION_SIMULATION_VERSION,
    decisionSimulationCatalogReady: decisionSimulationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `decision-compliance-catalog ready=${catalogReady}`,
      `items=${catalog.entryCount}`,
      `domains=${catalog.domainCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `simulationCatalog=${decisionSimulationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertDecisionComplianceCatalogPass(
  report: DecisionComplianceCatalogReport,
): asserts report is DecisionComplianceCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V74 decision compliance catalog not ready: ${report.summary}`);
  }
}
