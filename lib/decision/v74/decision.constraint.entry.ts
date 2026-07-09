/**
 * V74 P4 — Decision constraint catalog entry (read-only)
 */
export {
  CONSTRAINT_CATALOG_ENTRIES,
  CONSTRAINT_VALIDATION_CATALOG,
  buildConstraintCatalogManifest,
  buildConstraintValidationManifest,
  computeDeclarativeConstraintBlock,
  getConstraintCatalogEntriesByType,
  getConstraintCatalogEntryById,
  getConstraintValidationByConstraintRef,
  isDecisionConstraintCatalogRefsAligned,
} from "./decision.constraint.catalog";
export {
  assertDecisionConstraintCatalogPass,
  buildDecisionConstraintCatalog,
} from "./decision.constraint.builder";
export {
  V74_DECISION_CONSTRAINT_FREEZE_VERSION,
  V74_DECISION_CONSTRAINT_VERSION,
} from "./decision.constraint";
export type {
  ConstraintCatalogEntry,
  ConstraintLevel,
  ConstraintPriority,
  ConstraintTypeKind,
  ConstraintValidation,
  DecisionConstraintCatalogReport,
  DecisionConstraintCatalogSignals,
} from "./decision.constraint";

import { buildDecisionConstraintCatalog } from "./decision.constraint.builder";
import type {
  DecisionConstraintCatalogReport,
  DecisionConstraintCatalogSignals,
} from "./decision.constraint";

export function runDecisionConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionConstraintCatalogSignals;
}): DecisionConstraintCatalogReport {
  return buildDecisionConstraintCatalog(input);
}

export function formatDecisionConstraintCatalogSummary(
  report: DecisionConstraintCatalogReport,
): string {
  const lines = [
    "V74 Decision Constraint Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  decision-context-catalog: ${report.decisionContextCatalogVersion} (ready=${report.decisionContextCatalogReady})`,
    `  constraints: ${report.catalog.entryCount}`,
    `  types: ${report.catalog.typeCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
