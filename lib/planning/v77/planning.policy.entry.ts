/**
 * V77 P2 — Planning policy catalog entry (read-only)
 */
export {
  PLANNING_POLICY_CATALOG_ENTRIES,
  PLANNING_POLICY_GATE_CATALOG,
  buildPlanningPolicyCatalogManifest,
  buildPlanningPolicyGateManifest,
  computePlanningDeclarativePolicyBlock,
  getPlanningPolicyCatalogEntriesByKind,
  getPlanningPolicyCatalogEntryById,
  getPlanningPolicyGateByPolicyRef,
  isPlanningPolicyCatalogRefsAligned,
} from "./planning.policy.catalog";
export {
  assertPlanningPolicyCatalogPass,
  buildPlanningPolicyCatalog,
} from "./planning.policy.builder";
export {
  V77_PLANNING_POLICY_FREEZE_VERSION,
  V77_PLANNING_POLICY_VERSION,
} from "./planning.policy";
export type {
  PlanningPolicyCatalogEntry,
  PlanningPolicyCatalogKind,
  PlanningPolicyCatalogReport,
  PlanningPolicyCatalogSignals,
  PlanningPolicyEnforcement,
  PlanningPolicyGate,
} from "./planning.policy";

import { buildPlanningPolicyCatalog } from "./planning.policy.builder";
import type { PlanningPolicyCatalogReport, PlanningPolicyCatalogSignals } from "./planning.policy";

export function runPlanningPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningPolicyCatalogSignals;
}): PlanningPolicyCatalogReport {
  return buildPlanningPolicyCatalog(input);
}

export function formatPlanningPolicyCatalogSummary(report: PlanningPolicyCatalogReport): string {
  const lines = [
    "V77 Planning Policy Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  planning-inventory: ${report.planningInventoryVersion} (ready=${report.planningInventoryReady})`,
    `  policies: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  gates: ${report.gates.gateCount}`,
  ];
  return lines.join("\n");
}
