/**
 * V74 P2 — Decision policy catalog entry (read-only)
 */
export {
  POLICY_CATALOG_ENTRIES,
  POLICY_GATE_CATALOG,
  buildPolicyCatalogManifest,
  buildPolicyGateManifest,
  computeDeclarativePolicyBlock,
  getPolicyCatalogEntriesByKind,
  getPolicyCatalogEntryById,
  getPolicyGateByPolicyRef,
  isDecisionPolicyCatalogRefsAligned,
} from "./decision.policy.catalog";
export {
  assertDecisionPolicyCatalogPass,
  buildDecisionPolicyCatalog,
} from "./decision.policy.builder";
export {
  V74_DECISION_POLICY_FREEZE_VERSION,
  V74_DECISION_POLICY_VERSION,
} from "./decision.policy";
export type {
  DecisionPolicyCatalogReport,
  DecisionPolicyCatalogSignals,
  PolicyCatalogEntry,
  PolicyCatalogKind,
  PolicyEnforcement,
  PolicyGate,
} from "./decision.policy";

import { buildDecisionPolicyCatalog } from "./decision.policy.builder";
import type {
  DecisionPolicyCatalogReport,
  DecisionPolicyCatalogSignals,
} from "./decision.policy";

export function runDecisionPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: DecisionPolicyCatalogSignals;
}): DecisionPolicyCatalogReport {
  return buildDecisionPolicyCatalog(input);
}

export function formatDecisionPolicyCatalogSummary(
  report: DecisionPolicyCatalogReport,
): string {
  const lines = [
    "V74 Decision Policy Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  decision-inventory: ${report.decisionInventoryVersion} (ready=${report.decisionInventoryReady})`,
    `  policies: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  gates: ${report.gates.gateCount}`,
  ];
  return lines.join("\n");
}
