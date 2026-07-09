/**
 * V77 P5 — Planning evaluation catalog entry (read-only)
 */
export {
  PLANNING_EVALUATION_CATALOG_ENTRIES,
  PLANNING_EVALUATION_VALIDATION_CATALOG,
  buildPlanningEvaluationCatalogManifest,
  buildPlanningEvaluationValidationManifest,
  computePlanningDeclarativeEvaluationDeclared,
  getPlanningEvaluationCatalogEntriesByKind,
  getPlanningEvaluationCatalogEntryById,
  getPlanningEvaluationValidationByEvaluationRef,
  isPlanningEvaluationCatalogRefsAligned,
} from "./planning.evaluation.catalog";
export {
  assertPlanningEvaluationCatalogPass,
  buildPlanningEvaluationCatalog,
} from "./planning.evaluation.builder";
export {
  V77_PLANNING_EVALUATION_FREEZE_VERSION,
  V77_PLANNING_EVALUATION_VERSION,
} from "./planning.evaluation";
export type {
  PlanningEvaluationCatalogEntry,
  PlanningEvaluationCatalogReport,
  PlanningEvaluationCatalogSignals,
  PlanningEvaluationKind,
  PlanningEvaluationPriority,
  PlanningEvaluationValidation,
} from "./planning.evaluation";

import { buildPlanningEvaluationCatalog } from "./planning.evaluation.builder";
import type {
  PlanningEvaluationCatalogReport,
  PlanningEvaluationCatalogSignals,
} from "./planning.evaluation";

export function runPlanningEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningEvaluationCatalogSignals;
}): PlanningEvaluationCatalogReport {
  return buildPlanningEvaluationCatalog(input);
}

export function formatPlanningEvaluationCatalogSummary(
  report: PlanningEvaluationCatalogReport,
): string {
  const lines = [
    "V77 Planning Evaluation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  planning-constraint-catalog: ${report.planningConstraintCatalogVersion} (ready=${report.planningConstraintCatalogReady})`,
    `  evaluations: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
