/**
 * V78 P3 — Execution context catalog builder (read-only)
 */
import { buildExecutionPolicyCatalog } from "./execution.policy.builder";
import { V78_EXECUTION_POLICY_VERSION } from "./execution.policy";
import {
  buildExecutionContextCatalogManifest,
  buildExecutionContextValidationManifest,
  isExecutionContextCatalogRefsAligned,
} from "./execution.context.catalog";
import type {
  ExecutionContextCatalogReport,
  ExecutionContextCatalogSignals,
} from "./execution.context";
import {
  V78_EXECUTION_CONTEXT_FREEZE_VERSION,
  V78_EXECUTION_CONTEXT_VERSION,
} from "./execution.context";

const DEFAULT_SIGNALS: ExecutionContextCatalogSignals = {
  executionPolicyCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildExecutionContextCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionContextCatalogSignals;
}): ExecutionContextCatalogReport {
  const deploymentId = input?.deploymentId ?? "v78-execution-context-catalog-default";

  const executionPolicyCatalog = buildExecutionPolicyCatalog({ deploymentId });
  const catalog = buildExecutionContextCatalogManifest();
  const validations = buildExecutionContextValidationManifest();
  const refsAligned = isExecutionContextCatalogRefsAligned();

  const signals: ExecutionContextCatalogSignals = {
    ...DEFAULT_SIGNALS,
    executionPolicyCatalogReady: executionPolicyCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V78_EXECUTION_CONTEXT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    executionPolicyCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.executionPolicyCatalogReady !== false;

  return {
    version: V78_EXECUTION_CONTEXT_VERSION,
    freezeVersion: V78_EXECUTION_CONTEXT_FREEZE_VERSION,
    reportId: `execution-context-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    executionPolicyCatalogVersion: V78_EXECUTION_POLICY_VERSION,
    executionPolicyCatalogReady: executionPolicyCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `execution-context-catalog ready=${catalogReady}`,
      `contexts=${catalog.entryCount}`,
      `domains=${catalog.domainCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `policyCatalog=${executionPolicyCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertExecutionContextCatalogPass(
  report: ExecutionContextCatalogReport,
): asserts report is ExecutionContextCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V78 execution context catalog not ready: ${report.summary}`);
  }
}
