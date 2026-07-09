/**
 * V78 P5 — Execution evaluation catalog builder (read-only)
 */
import { buildExecutionConstraintCatalog } from "./execution.constraint.builder";
import { V78_EXECUTION_CONSTRAINT_VERSION } from "./execution.constraint";
import {
  buildExecutionEvaluationCatalogManifest,
  buildExecutionEvaluationValidationManifest,
  isExecutionEvaluationCatalogRefsAligned,
} from "./execution.evaluation.catalog";
import type {
  ExecutionEvaluationCatalogReport,
  ExecutionEvaluationCatalogSignals,
} from "./execution.evaluation";
import {
  V78_EXECUTION_EVALUATION_FREEZE_VERSION,
  V78_EXECUTION_EVALUATION_VERSION,
} from "./execution.evaluation";

const DEFAULT_SIGNALS: ExecutionEvaluationCatalogSignals = {
  executionConstraintCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildExecutionEvaluationCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionEvaluationCatalogSignals;
}): ExecutionEvaluationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v78-execution-evaluation-catalog-default";

  const executionConstraintCatalog = buildExecutionConstraintCatalog({ deploymentId });
  const catalog = buildExecutionEvaluationCatalogManifest();
  const validations = buildExecutionEvaluationValidationManifest();
  const refsAligned = isExecutionEvaluationCatalogRefsAligned();

  const signals: ExecutionEvaluationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    executionConstraintCatalogReady: executionConstraintCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V78_EXECUTION_EVALUATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    executionConstraintCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.executionConstraintCatalogReady !== false;

  return {
    version: V78_EXECUTION_EVALUATION_VERSION,
    freezeVersion: V78_EXECUTION_EVALUATION_FREEZE_VERSION,
    reportId: `execution-evaluation-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    executionConstraintCatalogVersion: V78_EXECUTION_CONSTRAINT_VERSION,
    executionConstraintCatalogReady: executionConstraintCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `execution-evaluation-catalog ready=${catalogReady}`,
      `evaluations=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `constraintCatalog=${executionConstraintCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertExecutionEvaluationCatalogPass(
  report: ExecutionEvaluationCatalogReport,
): asserts report is ExecutionEvaluationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V78 execution evaluation catalog not ready: ${report.summary}`);
  }
}
