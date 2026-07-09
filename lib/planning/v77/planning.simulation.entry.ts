/**
 * V77 P6 — Planning simulation catalog entry (read-only)
 */
export {
  PLANNING_SIMULATION_CATALOG_ENTRIES,
  PLANNING_SIMULATION_VALIDATION_CATALOG,
  buildPlanningSimulationCatalogManifest,
  buildPlanningSimulationValidationManifest,
  computePlanningDeclarativeSimulationDeclared,
  getPlanningSimulationCatalogEntriesByKind,
  getPlanningSimulationCatalogEntryById,
  getPlanningSimulationValidationBySimulationRef,
  isPlanningSimulationCatalogRefsAligned,
} from "./planning.simulation.catalog";
export {
  assertPlanningSimulationCatalogPass,
  buildPlanningSimulationCatalog,
} from "./planning.simulation.builder";
export {
  V77_PLANNING_SIMULATION_FREEZE_VERSION,
  V77_PLANNING_SIMULATION_VERSION,
} from "./planning.simulation";
export type {
  PlanningSimulationCatalogEntry,
  PlanningSimulationCatalogReport,
  PlanningSimulationCatalogSignals,
  PlanningSimulationKind,
  PlanningSimulationPriority,
  PlanningSimulationValidation,
} from "./planning.simulation";

import { buildPlanningSimulationCatalog } from "./planning.simulation.builder";
import type {
  PlanningSimulationCatalogReport,
  PlanningSimulationCatalogSignals,
} from "./planning.simulation";

export function runPlanningSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningSimulationCatalogSignals;
}): PlanningSimulationCatalogReport {
  return buildPlanningSimulationCatalog(input);
}

export function formatPlanningSimulationCatalogSummary(
  report: PlanningSimulationCatalogReport,
): string {
  const lines = [
    "V77 Planning Simulation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  planning-evaluation-catalog: ${report.planningEvaluationCatalogVersion} (ready=${report.planningEvaluationCatalogReady})`,
    `  simulations: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
