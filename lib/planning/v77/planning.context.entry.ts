/**
 * V77 P3 — Planning context catalog entry (read-only)
 */
export {
  PLANNING_CONTEXT_CATALOG_ENTRIES,
  PLANNING_CONTEXT_VALIDATION_CATALOG,
  buildPlanningContextCatalogManifest,
  buildPlanningContextValidationManifest,
  computePlanningDeclarativeContextValid,
  getPlanningContextCatalogEntriesByDomain,
  getPlanningContextCatalogEntryById,
  getPlanningContextValidationByContextRef,
  isPlanningContextCatalogRefsAligned,
} from "./planning.context.catalog";
export {
  assertPlanningContextCatalogPass,
  buildPlanningContextCatalog,
} from "./planning.context.builder";
export {
  V77_PLANNING_CONTEXT_FREEZE_VERSION,
  V77_PLANNING_CONTEXT_VERSION,
} from "./planning.context";
export type {
  PlanningContextCatalogEntry,
  PlanningContextCatalogReport,
  PlanningContextCatalogSignals,
  PlanningContextDomainKind,
  PlanningContextLifecycle,
  PlanningContextPriority,
  PlanningContextValidation,
} from "./planning.context";

import { buildPlanningContextCatalog } from "./planning.context.builder";
import type {
  PlanningContextCatalogReport,
  PlanningContextCatalogSignals,
} from "./planning.context";

export function runPlanningContextCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningContextCatalogSignals;
}): PlanningContextCatalogReport {
  return buildPlanningContextCatalog(input);
}

export function formatPlanningContextCatalogSummary(
  report: PlanningContextCatalogReport,
): string {
  const lines = [
    "V77 Planning Context Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  planning-policy-catalog: ${report.planningPolicyCatalogVersion} (ready=${report.planningPolicyCatalogReady})`,
    `  contexts: ${report.catalog.entryCount}`,
    `  domains: ${report.catalog.domainCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
