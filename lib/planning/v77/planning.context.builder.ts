/**
 * V77 P3 — Planning context catalog builder (read-only)
 */
import { buildPlanningPolicyCatalog } from "./planning.policy.builder";
import { V77_PLANNING_POLICY_VERSION } from "./planning.policy";
import {
  buildPlanningContextCatalogManifest,
  buildPlanningContextValidationManifest,
  isPlanningContextCatalogRefsAligned,
} from "./planning.context.catalog";
import type {
  PlanningContextCatalogReport,
  PlanningContextCatalogSignals,
} from "./planning.context";
import {
  V77_PLANNING_CONTEXT_FREEZE_VERSION,
  V77_PLANNING_CONTEXT_VERSION,
} from "./planning.context";

const DEFAULT_SIGNALS: PlanningContextCatalogSignals = {
  planningPolicyCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildPlanningContextCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningContextCatalogSignals;
}): PlanningContextCatalogReport {
  const deploymentId = input?.deploymentId ?? "v77-planning-context-catalog-default";

  const planningPolicyCatalog = buildPlanningPolicyCatalog({ deploymentId });
  const catalog = buildPlanningContextCatalogManifest();
  const validations = buildPlanningContextValidationManifest();
  const refsAligned = isPlanningContextCatalogRefsAligned();

  const signals: PlanningContextCatalogSignals = {
    ...DEFAULT_SIGNALS,
    planningPolicyCatalogReady: planningPolicyCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V77_PLANNING_CONTEXT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    planningPolicyCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.planningPolicyCatalogReady !== false;

  return {
    version: V77_PLANNING_CONTEXT_VERSION,
    freezeVersion: V77_PLANNING_CONTEXT_FREEZE_VERSION,
    reportId: `planning-context-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    planningPolicyCatalogVersion: V77_PLANNING_POLICY_VERSION,
    planningPolicyCatalogReady: planningPolicyCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `planning-context-catalog ready=${catalogReady}`,
      `contexts=${catalog.entryCount}`,
      `domains=${catalog.domainCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `policyCatalog=${planningPolicyCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertPlanningContextCatalogPass(
  report: PlanningContextCatalogReport,
): asserts report is PlanningContextCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V77 planning context catalog not ready: ${report.summary}`);
  }
}
