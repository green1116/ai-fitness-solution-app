/**
 * V77 P4 — Planning constraint catalog entry (read-only)
 */
export {
  PLANNING_CONSTRAINT_CATALOG_ENTRIES,
  PLANNING_CONSTRAINT_VALIDATION_CATALOG,
  buildPlanningConstraintCatalogManifest,
  buildPlanningConstraintValidationManifest,
  computePlanningDeclarativeConstraintBlock,
  getPlanningConstraintCatalogEntriesByKind,
  getPlanningConstraintCatalogEntryById,
  getPlanningConstraintValidationByConstraintRef,
  isPlanningConstraintCatalogRefsAligned,
} from "./planning.constraint.catalog";
export {
  assertPlanningConstraintCatalogPass,
  buildPlanningConstraintCatalog,
} from "./planning.constraint.builder";
export {
  V77_PLANNING_CONSTRAINT_FREEZE_VERSION,
  V77_PLANNING_CONSTRAINT_VERSION,
} from "./planning.constraint";
export type {
  PlanningConstraintCatalogEntry,
  PlanningConstraintCatalogReport,
  PlanningConstraintCatalogSignals,
  PlanningConstraintKind,
  PlanningConstraintLevel,
  PlanningConstraintPriority,
  PlanningConstraintValidation,
} from "./planning.constraint";

import { buildPlanningConstraintCatalog } from "./planning.constraint.builder";
import type {
  PlanningConstraintCatalogReport,
  PlanningConstraintCatalogSignals,
} from "./planning.constraint";

export function runPlanningConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningConstraintCatalogSignals;
}): PlanningConstraintCatalogReport {
  return buildPlanningConstraintCatalog(input);
}

export function formatPlanningConstraintCatalogSummary(
  report: PlanningConstraintCatalogReport,
): string {
  const lines = [
    "V77 Planning Constraint Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  planning-context-catalog: ${report.planningContextCatalogVersion} (ready=${report.planningContextCatalogReady})`,
    `  constraints: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
