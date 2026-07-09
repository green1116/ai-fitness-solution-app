/**
 * V74 P6 — Decision simulation catalog entry (read-only)
 */
export {
  SIMULATION_CATALOG_ENTRIES,
  SIMULATION_VALIDATION_CATALOG,
  buildSimulationCatalogManifest,
  buildSimulationValidationManifest,
  computeDeclarativeSimulationDeclared,
  getSimulationCatalogEntriesByType,
  getSimulationCatalogEntryById,
  getSimulationValidationBySimulationRef,
  isDecisionSimulationCatalogRefsAligned,
} from "./decision.simulation.catalog";
export {
  assertDecisionSimulationCatalogPass,
  buildDecisionSimulationCatalog,
} from "./decision.simulation.builder";
export {
  V74_DECISION_SIMULATION_FREEZE_VERSION,
  V74_DECISION_SIMULATION_VERSION,
} from "./decision.simulation";
export type {
  DecisionSimulationCatalogReport,
  DecisionSimulationCatalogSignals,
  SimulationCatalogEntry,
  SimulationPriority,
  SimulationTypeKind,
  SimulationValidation,
} from "./decision.simulation";

import { buildDecisionSimulationCatalog } from "./decision.simulation.builder";
import type {
  DecisionSimulationCatalogReport,
  DecisionSimulationCatalogSignals,
} from "./decision.simulation";

export function runDecisionSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionSimulationCatalogSignals;
}): DecisionSimulationCatalogReport {
  return buildDecisionSimulationCatalog(input);
}

export function formatDecisionSimulationCatalogSummary(
  report: DecisionSimulationCatalogReport,
): string {
  const lines = [
    "V74 Decision Simulation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  decision-evaluation-catalog: ${report.decisionEvaluationCatalogVersion} (ready=${report.decisionEvaluationCatalogReady})`,
    `  simulations: ${report.catalog.entryCount}`,
    `  types: ${report.catalog.typeCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
