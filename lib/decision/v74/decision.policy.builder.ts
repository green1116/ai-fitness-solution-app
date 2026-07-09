/**
 * V74 P2 — Decision policy catalog builder (read-only)
 */
import { buildDecisionInventory } from "./decision.inventory";
import { V74_DECISION_VERSION } from "./decision.types";
import {
  buildPolicyCatalogManifest,
  buildPolicyGateManifest,
  isDecisionPolicyCatalogRefsAligned,
} from "./decision.policy.catalog";
import type {
  DecisionPolicyCatalogReport,
  DecisionPolicyCatalogSignals,
} from "./decision.policy";
import {
  V74_DECISION_POLICY_FREEZE_VERSION,
  V74_DECISION_POLICY_VERSION,
} from "./decision.policy";

const DEFAULT_SIGNALS: DecisionPolicyCatalogSignals = {
  decisionInventoryReady: true,
  catalogComplete: true,
  gatesComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildDecisionPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionPolicyCatalogSignals;
}): DecisionPolicyCatalogReport {
  const deploymentId = input?.deploymentId ?? "v74-decision-policy-catalog-default";

  const decisionInventory = buildDecisionInventory({ deploymentId });
  const catalog = buildPolicyCatalogManifest();
  const gates = buildPolicyGateManifest();
  const refsAligned = isDecisionPolicyCatalogRefsAligned();

  const signals: DecisionPolicyCatalogSignals = {
    ...DEFAULT_SIGNALS,
    decisionInventoryReady: decisionInventory.inventoryReady,
    catalogComplete: catalog.catalogComplete,
    gatesComplete: gates.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V74_DECISION_POLICY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    decisionInventory.inventoryReady &&
    catalog.catalogComplete &&
    gates.catalogComplete &&
    refsAligned &&
    signals.decisionInventoryReady !== false;

  return {
    version: V74_DECISION_POLICY_VERSION,
    freezeVersion: V74_DECISION_POLICY_FREEZE_VERSION,
    reportId: `decision-policy-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    decisionInventoryVersion: V74_DECISION_VERSION,
    decisionInventoryReady: decisionInventory.inventoryReady,
    catalog,
    gates,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `decision-policy-catalog ready=${catalogReady}`,
      `policies=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `gates=${gates.gateCount}`,
      `refsAligned=${refsAligned}`,
      `inventory=${decisionInventory.inventoryReady}`,
    ].join(" "),
  };
}

export function assertDecisionPolicyCatalogPass(
  report: DecisionPolicyCatalogReport,
): asserts report is DecisionPolicyCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V74 decision policy catalog not ready: ${report.summary}`);
  }
}
