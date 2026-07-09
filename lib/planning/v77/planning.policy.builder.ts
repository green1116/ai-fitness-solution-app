/**
 * V77 P2 — Planning policy catalog builder (read-only)
 */
import { buildPlanningInventory } from "./planning.inventory";
import { V77_PLANNING_VERSION } from "./planning.types";
import {
  buildPlanningPolicyCatalogManifest,
  buildPlanningPolicyGateManifest,
  isPlanningPolicyCatalogRefsAligned,
} from "./planning.policy.catalog";
import type {
  PlanningPolicyCatalogReport,
  PlanningPolicyCatalogSignals,
} from "./planning.policy";
import {
  V77_PLANNING_POLICY_FREEZE_VERSION,
  V77_PLANNING_POLICY_VERSION,
} from "./planning.policy";

const DEFAULT_SIGNALS: PlanningPolicyCatalogSignals = {
  planningInventoryReady: true,
  catalogComplete: true,
  gatesComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildPlanningPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: PlanningPolicyCatalogSignals;
}): PlanningPolicyCatalogReport {
  const deploymentId = input?.deploymentId ?? "v77-planning-policy-catalog-default";

  const planningInventory = buildPlanningInventory({ deploymentId });
  const catalog = buildPlanningPolicyCatalogManifest();
  const gates = buildPlanningPolicyGateManifest();
  const refsAligned = isPlanningPolicyCatalogRefsAligned();

  const signals: PlanningPolicyCatalogSignals = {
    ...DEFAULT_SIGNALS,
    planningInventoryReady: planningInventory.inventoryReady,
    catalogComplete: catalog.catalogComplete,
    gatesComplete: gates.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V77_PLANNING_POLICY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    planningInventory.inventoryReady &&
    catalog.catalogComplete &&
    gates.catalogComplete &&
    refsAligned &&
    signals.planningInventoryReady !== false;

  return {
    version: V77_PLANNING_POLICY_VERSION,
    freezeVersion: V77_PLANNING_POLICY_FREEZE_VERSION,
    reportId: `planning-policy-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    planningInventoryVersion: V77_PLANNING_VERSION,
    planningInventoryReady: planningInventory.inventoryReady,
    catalog,
    gates,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `planning-policy-catalog ready=${catalogReady}`,
      `policies=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `gates=${gates.gateCount}`,
      `refsAligned=${refsAligned}`,
      `inventory=${planningInventory.inventoryReady}`,
    ].join(" "),
  };
}

export function assertPlanningPolicyCatalogPass(
  report: PlanningPolicyCatalogReport,
): asserts report is PlanningPolicyCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V77 planning policy catalog not ready: ${report.summary}`);
  }
}
