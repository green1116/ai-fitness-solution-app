/**
 * V78 P4 — Execution constraint catalog entry (read-only)
 */
export {
  EXECUTION_CONSTRAINT_CATALOG_ENTRIES,
  EXECUTION_CONSTRAINT_VALIDATION_CATALOG,
  buildExecutionConstraintCatalogManifest,
  buildExecutionConstraintValidationManifest,
  computeExecutionDeclarativeConstraintBlock,
  getExecutionConstraintCatalogEntriesByKind,
  getExecutionConstraintCatalogEntryById,
  getExecutionConstraintValidationByConstraintRef,
  isExecutionConstraintCatalogRefsAligned,
} from "./execution.constraint.catalog";
export {
  assertExecutionConstraintCatalogPass,
  buildExecutionConstraintCatalog,
} from "./execution.constraint.builder";
export {
  V78_EXECUTION_CONSTRAINT_FREEZE_VERSION,
  V78_EXECUTION_CONSTRAINT_VERSION,
} from "./execution.constraint";
export type {
  ExecutionConstraintCatalogEntry,
  ExecutionConstraintCatalogReport,
  ExecutionConstraintCatalogSignals,
  ExecutionConstraintKind,
  ExecutionConstraintLevel,
  ExecutionConstraintPriority,
  ExecutionConstraintValidation,
} from "./execution.constraint";

import { buildExecutionConstraintCatalog } from "./execution.constraint.builder";
import type {
  ExecutionConstraintCatalogReport,
  ExecutionConstraintCatalogSignals,
} from "./execution.constraint";

export function runExecutionConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionConstraintCatalogSignals;
}): ExecutionConstraintCatalogReport {
  return buildExecutionConstraintCatalog(input);
}

export function formatExecutionConstraintCatalogSummary(
  report: ExecutionConstraintCatalogReport,
): string {
  const lines = [
    "V78 Execution Constraint Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  execution-context-catalog: ${report.executionContextCatalogVersion} (ready=${report.executionContextCatalogReady})`,
    `  constraints: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
