/**
 * V74 P5 — Decision evaluation catalog entry (read-only)
 */
export {
  EVALUATION_CATALOG_ENTRIES,
  EVALUATION_VALIDATION_CATALOG,
  buildEvaluationCatalogManifest,
  buildEvaluationValidationManifest,
  computeDeclarativeEvaluationDeclared,
  getEvaluationCatalogEntriesByDimension,
  getEvaluationCatalogEntryById,
  getEvaluationValidationByEvaluationRef,
  isDecisionEvaluationCatalogRefsAligned,
} from "./decision.evaluation.catalog";
export {
  assertDecisionEvaluationCatalogPass,
  buildDecisionEvaluationCatalog,
} from "./decision.evaluation.builder";
export {
  V74_DECISION_EVALUATION_FREEZE_VERSION,
  V74_DECISION_EVALUATION_VERSION,
} from "./decision.evaluation";
export type {
  DecisionEvaluationCatalogReport,
  DecisionEvaluationCatalogSignals,
  EvaluationCatalogEntry,
  EvaluationDimensionKind,
  EvaluationPriority,
  EvaluationValidation,
} from "./decision.evaluation";

import { buildDecisionEvaluationCatalog } from "./decision.evaluation.builder";
import type {
  DecisionEvaluationCatalogReport,
  DecisionEvaluationCatalogSignals,
} from "./decision.evaluation";

export function runDecisionEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionEvaluationCatalogSignals;
}): DecisionEvaluationCatalogReport {
  return buildDecisionEvaluationCatalog(input);
}

export function formatDecisionEvaluationCatalogSummary(
  report: DecisionEvaluationCatalogReport,
): string {
  const lines = [
    "V74 Decision Evaluation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  decision-constraint-catalog: ${report.decisionConstraintCatalogVersion} (ready=${report.decisionConstraintCatalogReady})`,
    `  evaluations: ${report.catalog.entryCount}`,
    `  dimensions: ${report.catalog.dimensionCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
