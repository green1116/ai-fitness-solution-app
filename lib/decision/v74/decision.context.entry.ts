/**
 * V74 P3 — Decision context catalog entry (read-only)
 */
export {
  CONTEXT_CATALOG_ENTRIES,
  CONTEXT_VALIDATION_CATALOG,
  buildContextCatalogManifest,
  buildContextValidationManifest,
  computeDeclarativeContextValid,
  getContextCatalogEntriesByDomain,
  getContextCatalogEntryById,
  getContextValidationByContextRef,
  isDecisionContextCatalogRefsAligned,
} from "./decision.context.catalog";
export {
  assertDecisionContextCatalogPass,
  buildDecisionContextCatalog,
} from "./decision.context.builder";
export {
  V74_DECISION_CONTEXT_FREEZE_VERSION,
  V74_DECISION_CONTEXT_VERSION,
} from "./decision.context";
export type {
  ContextCatalogEntry,
  ContextDomainKind,
  ContextPriority,
  ContextValidation,
  DecisionContextCatalogReport,
  DecisionContextCatalogSignals,
} from "./decision.context";

import { buildDecisionContextCatalog } from "./decision.context.builder";
import type {
  DecisionContextCatalogReport,
  DecisionContextCatalogSignals,
} from "./decision.context";

export function runDecisionContextCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionContextCatalogSignals;
}): DecisionContextCatalogReport {
  return buildDecisionContextCatalog(input);
}

export function formatDecisionContextCatalogSummary(
  report: DecisionContextCatalogReport,
): string {
  const lines = [
    "V74 Decision Context Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  decision-policy-catalog: ${report.decisionPolicyCatalogVersion} (ready=${report.decisionPolicyCatalogReady})`,
    `  contexts: ${report.catalog.entryCount}`,
    `  domains: ${report.catalog.domainCount}`,
    `  validations: ${report.validations.entryCount}`,
  ];
  return lines.join("\n");
}
