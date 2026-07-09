/**
 * V78 P3 — Execution context catalog entry (read-only)
 */
export {
  EXECUTION_CONTEXT_CATALOG_ENTRIES,
  EXECUTION_CONTEXT_VALIDATION_CATALOG,
  buildExecutionContextCatalogManifest,
  buildExecutionContextValidationManifest,
  computeExecutionDeclarativeContextValid,
  getExecutionContextCatalogEntriesByDomain,
  getExecutionContextCatalogEntryById,
  getExecutionContextValidationByContextRef,
  isExecutionContextCatalogRefsAligned,
} from "./execution.context.catalog";
export {
  assertExecutionContextCatalogPass,
  buildExecutionContextCatalog,
} from "./execution.context.builder";
export {
  V78_EXECUTION_CONTEXT_FREEZE_VERSION,
  V78_EXECUTION_CONTEXT_VERSION,
} from "./execution.context";
export type {
  ExecutionContextCatalogEntry,
  ExecutionContextCatalogReport,
  ExecutionContextCatalogSignals,
  ExecutionContextDomainKind,
  ExecutionContextLifecycle,
  ExecutionContextPriority,
  ExecutionContextValidation,
} from "./execution.context";

import { buildExecutionContextCatalog } from "./execution.context.builder";
import type {
  ExecutionContextCatalogReport,
  ExecutionContextCatalogSignals,
} from "./execution.context";

export function runExecutionContextCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionContextCatalogSignals;
}): ExecutionContextCatalogReport {
  return buildExecutionContextCatalog(input);
}

export function formatExecutionContextCatalogSummary(
  report: ExecutionContextCatalogReport,
): string {
  const lines = [
    "V78 Execution Context Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  execution-policy-catalog: ${report.executionPolicyCatalogVersion} (ready=${report.executionPolicyCatalogReady})`,
    `  contexts: ${report.catalog.entryCount}`,
    `  domains: ${report.catalog.domainCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
