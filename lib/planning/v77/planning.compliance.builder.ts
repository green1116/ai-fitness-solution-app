/**
 * V77 P7 — Planning compliance catalog builder (read-only)
 */
import { buildPlanningSimulationCatalog } from "./planning.simulation.builder";
import { V77_PLANNING_SIMULATION_VERSION } from "./planning.simulation";
import {
  buildPlanningComplianceCatalogManifest,
  buildPlanningComplianceValidationManifest,
  isPlanningComplianceCatalogRefsAligned,
} from "./planning.compliance.catalog";
import type {
  PlanningComplianceCatalogReport,
  PlanningComplianceCatalogSignals,
} from "./planning.compliance";
import {
  V77_PLANNING_COMPLIANCE_FREEZE_VERSION,
  V77_PLANNING_COMPLIANCE_VERSION,
} from "./planning.compliance";

const DEFAULT_SIGNALS: PlanningComplianceCatalogSignals = {
  planningSimulationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildPlanningComplianceCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningComplianceCatalogSignals;
}): PlanningComplianceCatalogReport {
  const deploymentId = input?.deploymentId ?? "v77-planning-compliance-catalog-default";

  const planningSimulationCatalog = buildPlanningSimulationCatalog({ deploymentId });
  const catalog = buildPlanningComplianceCatalogManifest();
  const validations = buildPlanningComplianceValidationManifest();
  const refsAligned = isPlanningComplianceCatalogRefsAligned();

  const signals: PlanningComplianceCatalogSignals = {
    ...DEFAULT_SIGNALS,
    planningSimulationCatalogReady: planningSimulationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V77_PLANNING_COMPLIANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    planningSimulationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.planningSimulationCatalogReady !== false;

  return {
    version: V77_PLANNING_COMPLIANCE_VERSION,
    freezeVersion: V77_PLANNING_COMPLIANCE_FREEZE_VERSION,
    reportId: `planning-compliance-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    planningSimulationCatalogVersion: V77_PLANNING_SIMULATION_VERSION,
    planningSimulationCatalogReady: planningSimulationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `planning-compliance-catalog ready=${catalogReady}`,
      `items=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `simulationCatalog=${planningSimulationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertPlanningComplianceCatalogPass(
  report: PlanningComplianceCatalogReport,
): asserts report is PlanningComplianceCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V77 planning compliance catalog not ready: ${report.summary}`);
  }
}
