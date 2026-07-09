/**
 * V78 P4 — Execution constraint catalog builder (read-only)
 */
import { buildExecutionContextCatalog } from "./execution.context.builder";
import { V78_EXECUTION_CONTEXT_VERSION } from "./execution.context";
import {
  buildExecutionConstraintCatalogManifest,
  buildExecutionConstraintValidationManifest,
  isExecutionConstraintCatalogRefsAligned,
} from "./execution.constraint.catalog";
import type {
  ExecutionConstraintCatalogReport,
  ExecutionConstraintCatalogSignals,
} from "./execution.constraint";
import {
  V78_EXECUTION_CONSTRAINT_FREEZE_VERSION,
  V78_EXECUTION_CONSTRAINT_VERSION,
} from "./execution.constraint";

const DEFAULT_SIGNALS: ExecutionConstraintCatalogSignals = {
  executionContextCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildExecutionConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionConstraintCatalogSignals;
}): ExecutionConstraintCatalogReport {
  const deploymentId = input?.deploymentId ?? "v78-execution-constraint-catalog-default";

  const executionContextCatalog = buildExecutionContextCatalog({ deploymentId });
  const catalog = buildExecutionConstraintCatalogManifest();
  const validations = buildExecutionConstraintValidationManifest();
  const refsAligned = isExecutionConstraintCatalogRefsAligned();

  const signals: ExecutionConstraintCatalogSignals = {
    ...DEFAULT_SIGNALS,
    executionContextCatalogReady: executionContextCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V78_EXECUTION_CONSTRAINT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    executionContextCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.executionContextCatalogReady !== false;

  return {
    version: V78_EXECUTION_CONSTRAINT_VERSION,
    freezeVersion: V78_EXECUTION_CONSTRAINT_FREEZE_VERSION,
    reportId: `execution-constraint-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    executionContextCatalogVersion: V78_EXECUTION_CONTEXT_VERSION,
    executionContextCatalogReady: executionContextCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `execution-constraint-catalog ready=${catalogReady}`,
      `constraints=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `contextCatalog=${executionContextCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertExecutionConstraintCatalogPass(
  report: ExecutionConstraintCatalogReport,
): asserts report is ExecutionConstraintCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V78 execution constraint catalog not ready: ${report.summary}`);
  }
}
