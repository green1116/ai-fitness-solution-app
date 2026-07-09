/**
 * V77 P5 — Planning evaluation catalog builder (read-only)
 */
import { buildPlanningConstraintCatalog } from "./planning.constraint.builder";
import { V77_PLANNING_CONSTRAINT_VERSION } from "./planning.constraint";
import {
  buildPlanningEvaluationCatalogManifest,
  buildPlanningEvaluationValidationManifest,
  isPlanningEvaluationCatalogRefsAligned,
} from "./planning.evaluation.catalog";
import type {
  PlanningEvaluationCatalogReport,
  PlanningEvaluationCatalogSignals,
} from "./planning.evaluation";
import {
  V77_PLANNING_EVALUATION_FREEZE_VERSION,
  V77_PLANNING_EVALUATION_VERSION,
} from "./planning.evaluation";

const DEFAULT_SIGNALS: PlanningEvaluationCatalogSignals = {
  planningConstraintCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildPlanningEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningEvaluationCatalogSignals;
}): PlanningEvaluationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v77-planning-evaluation-catalog-default";

  const planningConstraintCatalog = buildPlanningConstraintCatalog({ deploymentId });
  const catalog = buildPlanningEvaluationCatalogManifest();
  const validations = buildPlanningEvaluationValidationManifest();
  const refsAligned = isPlanningEvaluationCatalogRefsAligned();

  const signals: PlanningEvaluationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    planningConstraintCatalogReady: planningConstraintCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V77_PLANNING_EVALUATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    planningConstraintCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.planningConstraintCatalogReady !== false;

  return {
    version: V77_PLANNING_EVALUATION_VERSION,
    freezeVersion: V77_PLANNING_EVALUATION_FREEZE_VERSION,
    reportId: `planning-evaluation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    planningConstraintCatalogVersion: V77_PLANNING_CONSTRAINT_VERSION,
    planningConstraintCatalogReady: planningConstraintCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `planning-evaluation-catalog ready=${catalogReady}`,
      `evaluations=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `constraintCatalog=${planningConstraintCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertPlanningEvaluationCatalogPass(
  report: PlanningEvaluationCatalogReport,
): asserts report is PlanningEvaluationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V77 planning evaluation catalog not ready: ${report.summary}`);
  }
}
