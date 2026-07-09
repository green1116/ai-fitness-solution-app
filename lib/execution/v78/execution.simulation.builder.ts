/**
 * V78 P6 — Execution simulation catalog builder (read-only)
 */
import { buildExecutionEvaluationCatalog } from "./execution.evaluation.builder";
import { V78_EXECUTION_EVALUATION_VERSION } from "./execution.evaluation";
import {
  buildExecutionSimulationCatalogManifest,
  buildExecutionSimulationValidationManifest,
  isExecutionSimulationCatalogRefsAligned,
} from "./execution.simulation.catalog";
import type {
  ExecutionSimulationCatalogReport,
  ExecutionSimulationCatalogSignals,
} from "./execution.simulation";
import {
  V78_EXECUTION_SIMULATION_FREEZE_VERSION,
  V78_EXECUTION_SIMULATION_VERSION,
} from "./execution.simulation";

const DEFAULT_SIGNALS: ExecutionSimulationCatalogSignals = {
  executionEvaluationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildExecutionSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionSimulationCatalogSignals;
}): ExecutionSimulationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v78-execution-simulation-catalog-default";

  const executionEvaluationCatalog = buildExecutionEvaluationCatalog({ deploymentId });
  const catalog = buildExecutionSimulationCatalogManifest();
  const validations = buildExecutionSimulationValidationManifest();
  const refsAligned = isExecutionSimulationCatalogRefsAligned();

  const signals: ExecutionSimulationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    executionEvaluationCatalogReady: executionEvaluationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V78_EXECUTION_SIMULATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    executionEvaluationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.executionEvaluationCatalogReady !== false;

  return {
    version: V78_EXECUTION_SIMULATION_VERSION,
    freezeVersion: V78_EXECUTION_SIMULATION_FREEZE_VERSION,
    reportId: `execution-simulation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    executionEvaluationCatalogVersion: V78_EXECUTION_EVALUATION_VERSION,
    executionEvaluationCatalogReady: executionEvaluationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `execution-simulation-catalog ready=${catalogReady}`,
      `simulations=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `evaluationCatalog=${executionEvaluationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertExecutionSimulationCatalogPass(
  report: ExecutionSimulationCatalogReport,
): asserts report is ExecutionSimulationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V78 execution simulation catalog not ready: ${report.summary}`);
  }
}
