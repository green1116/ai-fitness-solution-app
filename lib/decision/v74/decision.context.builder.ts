/**
 * V74 P3 — Decision context catalog builder (read-only)
 */
import { buildDecisionPolicyCatalog } from "./decision.policy.builder";
import { V74_DECISION_POLICY_VERSION } from "./decision.policy";
import {
  buildContextCatalogManifest,
  buildContextValidationManifest,
  isDecisionContextCatalogRefsAligned,
} from "./decision.context.catalog";
import type {
  DecisionContextCatalogReport,
  DecisionContextCatalogSignals,
} from "./decision.context";
import {
  V74_DECISION_CONTEXT_FREEZE_VERSION,
  V74_DECISION_CONTEXT_VERSION,
} from "./decision.context";

const DEFAULT_SIGNALS: DecisionContextCatalogSignals = {
  decisionPolicyCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildDecisionContextCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionContextCatalogSignals;
}): DecisionContextCatalogReport {
  const deploymentId = input?.deploymentId ?? "v74-decision-context-catalog-default";

  const decisionPolicyCatalog = buildDecisionPolicyCatalog({ deploymentId });
  const catalog = buildContextCatalogManifest();
  const validations = buildContextValidationManifest();
  const refsAligned = isDecisionContextCatalogRefsAligned();

  const signals: DecisionContextCatalogSignals = {
    ...DEFAULT_SIGNALS,
    decisionPolicyCatalogReady: decisionPolicyCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V74_DECISION_CONTEXT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    decisionPolicyCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.decisionPolicyCatalogReady !== false;

  return {
    version: V74_DECISION_CONTEXT_VERSION,
    freezeVersion: V74_DECISION_CONTEXT_FREEZE_VERSION,
    reportId: `decision-context-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    decisionPolicyCatalogVersion: V74_DECISION_POLICY_VERSION,
    decisionPolicyCatalogReady: decisionPolicyCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `decision-context-catalog ready=${catalogReady}`,
      `contexts=${catalog.entryCount}`,
      `domains=${catalog.domainCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `policyCatalog=${decisionPolicyCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertDecisionContextCatalogPass(
  report: DecisionContextCatalogReport,
): asserts report is DecisionContextCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V74 decision context catalog not ready: ${report.summary}`);
  }
}
