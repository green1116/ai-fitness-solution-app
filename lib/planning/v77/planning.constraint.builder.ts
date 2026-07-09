/**
 * V77 P4 — Planning constraint catalog builder (read-only)
 */
import { buildPlanningContextCatalog } from "./planning.context.builder";
import { V77_PLANNING_CONTEXT_VERSION } from "./planning.context";
import {
  buildPlanningConstraintCatalogManifest,
  buildPlanningConstraintValidationManifest,
  isPlanningConstraintCatalogRefsAligned,
} from "./planning.constraint.catalog";
import type {
  PlanningConstraintCatalogReport,
  PlanningConstraintCatalogSignals,
} from "./planning.constraint";
import {
  V77_PLANNING_CONSTRAINT_FREEZE_VERSION,
  V77_PLANNING_CONSTRAINT_VERSION,
} from "./planning.constraint";

const DEFAULT_SIGNALS: PlanningConstraintCatalogSignals = {
  planningContextCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildPlanningConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningConstraintCatalogSignals;
}): PlanningConstraintCatalogReport {
  const deploymentId = input?.deploymentId ?? "v77-planning-constraint-catalog-default";

  const planningContextCatalog = buildPlanningContextCatalog({ deploymentId });
  const catalog = buildPlanningConstraintCatalogManifest();
  const validations = buildPlanningConstraintValidationManifest();
  const refsAligned = isPlanningConstraintCatalogRefsAligned();

  const signals: PlanningConstraintCatalogSignals = {
    ...DEFAULT_SIGNALS,
    planningContextCatalogReady: planningContextCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V77_PLANNING_CONSTRAINT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    planningContextCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.planningContextCatalogReady !== false;

  return {
    version: V77_PLANNING_CONSTRAINT_VERSION,
    freezeVersion: V77_PLANNING_CONSTRAINT_FREEZE_VERSION,
    reportId: `planning-constraint-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    planningContextCatalogVersion: V77_PLANNING_CONTEXT_VERSION,
    planningContextCatalogReady: planningContextCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `planning-constraint-catalog ready=${catalogReady}`,
      `constraints=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `contextCatalog=${planningContextCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertPlanningConstraintCatalogPass(
  report: PlanningConstraintCatalogReport,
): asserts report is PlanningConstraintCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V77 planning constraint catalog not ready: ${report.summary}`);
  }
}
