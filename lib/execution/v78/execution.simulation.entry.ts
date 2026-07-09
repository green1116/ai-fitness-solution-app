/**
 * V78 P6 — Execution simulation catalog entry (read-only)
 */
export {
  EXECUTION_SIMULATION_CATALOG_ENTRIES,
  EXECUTION_SIMULATION_VALIDATION_CATALOG,
  buildExecutionSimulationCatalogManifest,
  buildExecutionSimulationValidationManifest,
  computeExecutionDeclarativeSimulationDeclared,
  getExecutionSimulationCatalogEntriesByKind,
  getExecutionSimulationCatalogEntryById,
  getExecutionSimulationValidationBySimulationRef,
  isExecutionSimulationCatalogRefsAligned,
} from "./execution.simulation.catalog";
export {
  assertExecutionSimulationCatalogPass,
  buildExecutionSimulationCatalog,
} from "./execution.simulation.builder";
export {
  V78_EXECUTION_SIMULATION_FREEZE_VERSION,
  V78_EXECUTION_SIMULATION_VERSION,
} from "./execution.simulation";
export type {
  ExecutionSimulationCatalogEntry,
  ExecutionSimulationCatalogReport,
  ExecutionSimulationCatalogSignals,
  ExecutionSimulationKind,
  ExecutionSimulationPriority,
  ExecutionSimulationValidation,
} from "./execution.simulation";

import { buildExecutionSimulationCatalog } from "./execution.simulation.builder";
import type {
  ExecutionSimulationCatalogReport,
  ExecutionSimulationCatalogSignals,
} from "./execution.simulation";

export function runExecutionSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionSimulationCatalogSignals;
}): ExecutionSimulationCatalogReport {
  return buildExecutionSimulationCatalog(input);
}

export function formatExecutionSimulationCatalogSummary(
  report: ExecutionSimulationCatalogReport,
): string {
  const lines = [
    "V78 Execution Simulation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  execution-evaluation-catalog: ${report.executionEvaluationCatalogVersion} (ready=${report.executionEvaluationCatalogReady})`,
    `  simulations: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
