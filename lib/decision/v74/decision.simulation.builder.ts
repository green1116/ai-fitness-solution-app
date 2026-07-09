/**
 * V74 P6 — Decision simulation catalog builder (read-only)
 */
import { buildDecisionEvaluationCatalog } from "./decision.evaluation.builder";
import { V74_DECISION_EVALUATION_VERSION } from "./decision.evaluation";
import {
  buildSimulationCatalogManifest,
  buildSimulationValidationManifest,
  isDecisionSimulationCatalogRefsAligned,
} from "./decision.simulation.catalog";
import type {
  DecisionSimulationCatalogReport,
  DecisionSimulationCatalogSignals,
} from "./decision.simulation";
import {
  V74_DECISION_SIMULATION_FREEZE_VERSION,
  V74_DECISION_SIMULATION_VERSION,
} from "./decision.simulation";

const DEFAULT_SIGNALS: DecisionSimulationCatalogSignals = {
  decisionEvaluationCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildDecisionSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionSimulationCatalogSignals;
}): DecisionSimulationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v74-decision-simulation-catalog-default";

  const decisionEvaluationCatalog = buildDecisionEvaluationCatalog({ deploymentId });
  const catalog = buildSimulationCatalogManifest();
  const validations = buildSimulationValidationManifest();
  const refsAligned = isDecisionSimulationCatalogRefsAligned();

  const signals: DecisionSimulationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    decisionEvaluationCatalogReady: decisionEvaluationCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V74_DECISION_SIMULATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    decisionEvaluationCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.decisionEvaluationCatalogReady !== false;

  return {
    version: V74_DECISION_SIMULATION_VERSION,
    freezeVersion: V74_DECISION_SIMULATION_FREEZE_VERSION,
    reportId: `decision-simulation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    decisionEvaluationCatalogVersion: V74_DECISION_EVALUATION_VERSION,
    decisionEvaluationCatalogReady: decisionEvaluationCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `decision-simulation-catalog ready=${catalogReady}`,
      `simulations=${catalog.entryCount}`,
      `types=${catalog.typeCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `evaluationCatalog=${decisionEvaluationCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertDecisionSimulationCatalogPass(
  report: DecisionSimulationCatalogReport,
): asserts report is DecisionSimulationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V74 decision simulation catalog not ready: ${report.summary}`);
  }
}
