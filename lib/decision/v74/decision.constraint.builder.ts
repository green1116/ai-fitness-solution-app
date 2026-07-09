/**
 * V74 P4 — Decision constraint catalog builder (read-only)
 */
import { buildDecisionContextCatalog } from "./decision.context.builder";
import { V74_DECISION_CONTEXT_VERSION } from "./decision.context";
import {
  buildConstraintCatalogManifest,
  buildConstraintValidationManifest,
  isDecisionConstraintCatalogRefsAligned,
} from "./decision.constraint.catalog";
import type {
  DecisionConstraintCatalogReport,
  DecisionConstraintCatalogSignals,
} from "./decision.constraint";
import {
  V74_DECISION_CONSTRAINT_FREEZE_VERSION,
  V74_DECISION_CONSTRAINT_VERSION,
} from "./decision.constraint";

const DEFAULT_SIGNALS: DecisionConstraintCatalogSignals = {
  decisionContextCatalogReady: true,
  catalogComplete: true,
  validationsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildDecisionConstraintCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionConstraintCatalogSignals;
}): DecisionConstraintCatalogReport {
  const deploymentId = input?.deploymentId ?? "v74-decision-constraint-catalog-default";

  const decisionContextCatalog = buildDecisionContextCatalog({ deploymentId });
  const catalog = buildConstraintCatalogManifest();
  const validations = buildConstraintValidationManifest();
  const refsAligned = isDecisionConstraintCatalogRefsAligned();

  const signals: DecisionConstraintCatalogSignals = {
    ...DEFAULT_SIGNALS,
    decisionContextCatalogReady: decisionContextCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    validationsComplete: validations.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V74_DECISION_CONSTRAINT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    decisionContextCatalog.catalogReady &&
    catalog.catalogComplete &&
    validations.catalogComplete &&
    refsAligned &&
    signals.decisionContextCatalogReady !== false;

  return {
    version: V74_DECISION_CONSTRAINT_VERSION,
    freezeVersion: V74_DECISION_CONSTRAINT_FREEZE_VERSION,
    reportId: `decision-constraint-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    decisionContextCatalogVersion: V74_DECISION_CONTEXT_VERSION,
    decisionContextCatalogReady: decisionContextCatalog.catalogReady,
    catalog,
    validations,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `decision-constraint-catalog ready=${catalogReady}`,
      `constraints=${catalog.entryCount}`,
      `types=${catalog.typeCount}`,
      `validations=${validations.entryCount}`,
      `refsAligned=${refsAligned}`,
      `contextCatalog=${decisionContextCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertDecisionConstraintCatalogPass(
  report: DecisionConstraintCatalogReport,
): asserts report is DecisionConstraintCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V74 decision constraint catalog not ready: ${report.summary}`);
  }
}
