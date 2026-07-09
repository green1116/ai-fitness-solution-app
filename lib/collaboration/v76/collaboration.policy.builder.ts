/**
 * V76 P2 — Collaboration policy catalog builder (read-only)
 */
import { buildCollaborationInventory } from "./collaboration.inventory";
import { V76_COLLABORATION_VERSION } from "./collaboration.types";
import {
  buildCollaborationPolicyCatalogManifest,
  buildCollaborationPolicyGateManifest,
  isCollaborationPolicyCatalogRefsAligned,
} from "./collaboration.policy.catalog";
import type {
  CollaborationPolicyCatalogReport,
  CollaborationPolicyCatalogSignals,
} from "./collaboration.policy";
import {
  V76_COLLABORATION_POLICY_FREEZE_VERSION,
  V76_COLLABORATION_POLICY_VERSION,
} from "./collaboration.policy";

const DEFAULT_SIGNALS: CollaborationPolicyCatalogSignals = {
  collaborationInventoryReady: true,
  catalogComplete: true,
  gatesComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildCollaborationPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationPolicyCatalogSignals;
}): CollaborationPolicyCatalogReport {
  const deploymentId = input?.deploymentId ?? "v76-collaboration-policy-catalog-default";

  const collaborationInventory = buildCollaborationInventory({ deploymentId });
  const catalog = buildCollaborationPolicyCatalogManifest();
  const gates = buildCollaborationPolicyGateManifest();
  const refsAligned = isCollaborationPolicyCatalogRefsAligned();

  const signals: CollaborationPolicyCatalogSignals = {
    ...DEFAULT_SIGNALS,
    collaborationInventoryReady: collaborationInventory.inventoryReady,
    catalogComplete: catalog.catalogComplete,
    gatesComplete: gates.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V76_COLLABORATION_POLICY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    collaborationInventory.inventoryReady &&
    catalog.catalogComplete &&
    gates.catalogComplete &&
    refsAligned &&
    signals.collaborationInventoryReady !== false;

  return {
    version: V76_COLLABORATION_POLICY_VERSION,
    freezeVersion: V76_COLLABORATION_POLICY_FREEZE_VERSION,
    reportId: `collaboration-policy-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    collaborationInventoryVersion: V76_COLLABORATION_VERSION,
    collaborationInventoryReady: collaborationInventory.inventoryReady,
    catalog,
    gates,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `collaboration-policy-catalog ready=${catalogReady}`,
      `policies=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `gates=${gates.gateCount}`,
      `refsAligned=${refsAligned}`,
      `inventory=${collaborationInventory.inventoryReady}`,
    ].join(" "),
  };
}

export function assertCollaborationPolicyCatalogPass(
  report: CollaborationPolicyCatalogReport,
): asserts report is CollaborationPolicyCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V76 collaboration policy catalog not ready: ${report.summary}`);
  }
}
