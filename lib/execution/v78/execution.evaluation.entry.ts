/**
 * V78 P5 — Execution evaluation catalog entry (read-only)
 */
export {
  EXECUTION_EVALUATION_CATALOG_ENTRIES,
  EXECUTION_EVALUATION_VALIDATION_CATALOG,
  buildExecutionEvaluationCatalogManifest,
  buildExecutionEvaluationValidationManifest,
  computeExecutionDeclarativeEvaluationDeclared,
  getExecutionEvaluationCatalogEntriesByKind,
  getExecutionEvaluationCatalogEntryById,
  getExecutionEvaluationValidationByEvaluationRef,
  isExecutionEvaluationCatalogRefsAligned,
} from "./execution.evaluation.catalog";
export {
  assertExecutionEvaluationCatalogPass,
  buildExecutionEvaluationCatalog,
} from "./execution.evaluation.builder";
export {
  V78_EXECUTION_EVALUATION_FREEZE_VERSION,
  V78_EXECUTION_EVALUATION_VERSION,
} from "./execution.evaluation";
export type {
  ExecutionEvaluationCatalogEntry,
  ExecutionEvaluationCatalogReport,
  ExecutionEvaluationCatalogSignals,
  ExecutionEvaluationKind,
  ExecutionEvaluationPriority,
  ExecutionEvaluationValidation,
} from "./execution.evaluation";

import { buildExecutionEvaluationCatalog } from "./execution.evaluation.builder";
import type {
  ExecutionEvaluationCatalogReport,
  ExecutionEvaluationCatalogSignals,
} from "./execution.evaluation";

export function runExecutionEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionEvaluationCatalogSignals;
}): ExecutionEvaluationCatalogReport {
  return buildExecutionEvaluationCatalog(input);
}

export function formatExecutionEvaluationCatalogSummary(
  report: ExecutionEvaluationCatalogReport,
): string {
  const lines = [
    "V78 Execution Evaluation Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  execution-constraint-catalog: ${report.executionConstraintCatalogVersion} (ready=${report.executionConstraintCatalogReady})`,
    `  evaluations: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
