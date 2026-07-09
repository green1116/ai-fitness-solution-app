/**
 * V74 P5 — Decision evaluation catalog builder (read-only)
 */
import { buildDecisionConstraintCatalog } from "./decision.constraint.builder";
import { V74_DECISION_CONSTRAINT_VERSION } from "./decision.constraint";
import {
  buildEvaluationCatalogManifest,
  buildEvaluationValidationManifest,
  isDecisionEvaluationCatalogRefsAligned,
} from "./decision.evaluation.catalog";
import type {
  DecisionEvaluationCatalogReport,
  DecisionEvaluationCatalogSignals,
} from "./decision.evaluation";
import {
  V74_DECISION_EVALUATION_FREEZE_VERSION,
  V74_DECISION_EVALUATION_VERSION,
} from "./decision.evaluation";

const DEFAULT_SIGNALS: DecisionEvaluationCatalogSignals = {
  decisionConstraintCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildDecisionEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionEvaluationCatalogSignals;
}): DecisionEvaluationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v74-decision-evaluation-catalog-default";

  const decisionConstraintCatalog = buildDecisionConstraintCatalog({ deploymentId });
  const catalog = buildEvaluationCatalogManifest();
  const validations = buildEvaluationValidationManifest();
  const refsAligned = isDecisionEvaluationCatalogRefsAligned();

  const signals: DecisionEvaluationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    decisionConstraintCatalogReady: decisionConstraintCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V74_DECISION_EVALUATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    decisionConstraintCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.decisionConstraintCatalogReady !== false;

  return {
    version: V74_DECISION_EVALUATION_VERSION,
    freezeVersion: V74_DECISION_EVALUATION_FREEZE_VERSION,
    reportId: `decision-evaluation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    decisionConstraintCatalogVersion: V74_DECISION_CONSTRAINT_VERSION,
    decisionConstraintCatalogReady: decisionConstraintCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `decision-evaluation-catalog ready=${catalogReady}`,
      `evaluations=${catalog.entryCount}`,
      `dimensions=${catalog.dimensionCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `constraintCatalog=${decisionConstraintCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertDecisionEvaluationCatalogPass(
  report: DecisionEvaluationCatalogReport,
): asserts report is DecisionEvaluationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V74 decision evaluation catalog not ready: ${report.summary}`);
  }
}
