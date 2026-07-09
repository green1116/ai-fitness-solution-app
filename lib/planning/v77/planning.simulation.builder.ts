/**
 * V77 P6 — Planning simulation catalog builder (read-only)
 */
import { buildPlanningEvaluationCatalog } from "./planning.evaluation.builder";
import { V77_PLANNING_EVALUATION_VERSION } from "./planning.evaluation";
import {
  buildPlanningSimulationCatalogManifest,
  buildPlanningSimulationValidationManifest,
  isPlanningSimulationCatalogRefsAligned,
} from "./planning.simulation.catalog";
import type {
  PlanningSimulationCatalogReport,
  PlanningSimulationCatalogSignals,
} from "./planning.simulation";
import {
  V77_PLANNING_SIMULATION_FREEZE_VERSION,
  V77_PLANNING_SIMULATION_VERSION,
} from "./planning.simulation";

const DEFAULT_SIGNALS: PlanningSimulationCatalogSignals = {
  planningEvaluationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildPlanningSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningSimulationCatalogSignals;
}): PlanningSimulationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v77-planning-simulation-catalog-default";

  const planningEvaluationCatalog = buildPlanningEvaluationCatalog({ deploymentId });
  const catalog = buildPlanningSimulationCatalogManifest();
  const validations = buildPlanningSimulationValidationManifest();
  const refsAligned = isPlanningSimulationCatalogRefsAligned();

  const signals: PlanningSimulationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    planningEvaluationCatalogReady: planningEvaluationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V77_PLANNING_SIMULATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    planningEvaluationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.planningEvaluationCatalogReady !== false;

  return {
    version: V77_PLANNING_SIMULATION_VERSION,
    freezeVersion: V77_PLANNING_SIMULATION_FREEZE_VERSION,
    reportId: `planning-simulation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    planningEvaluationCatalogVersion: V77_PLANNING_EVALUATION_VERSION,
    planningEvaluationCatalogReady: planningEvaluationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `planning-simulation-catalog ready=${catalogReady}`,
      `simulations=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `evaluationCatalog=${planningEvaluationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertPlanningSimulationCatalogPass(
  report: PlanningSimulationCatalogReport,
): asserts report is PlanningSimulationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V77 planning simulation catalog not ready: ${report.summary}`);
  }
}
