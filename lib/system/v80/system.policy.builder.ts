/**
 * V80 P2 — System meta policy builder (read-only)
 */
import { buildSystemInventory } from "./system.inventory";
import { V80_SYSTEM_VERSION } from "./system.types";
import { buildSystemInvariantManifest } from "./system.invariant.catalog";
import { buildSystemMetaConstraintManifest } from "./system.constraint.catalog";
import { buildSystemPolicyBoundaryManifest } from "./system.policy.boundary";
import {
  buildSystemPolicyCatalogManifest,
  isSystemPolicyCatalogRefsAligned,
} from "./system.policy.catalog";
import type { SystemPolicyCatalogReport, SystemPolicyCatalogSignals } from "./system.policy";
import { V80_SYSTEM_POLICY_FREEZE_VERSION, V80_SYSTEM_POLICY_VERSION } from "./system.policy";

const DEFAULT_SIGNALS: SystemPolicyCatalogSignals = {
  systemInventoryReady: true,
  catalogComplete: true,
  invariantsComplete: true,
  constraintsComplete: true,
  boundaryComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildSystemPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: SystemPolicyCatalogSignals;
}): SystemPolicyCatalogReport {
  const deploymentId = input?.deploymentId ?? "v80-system-meta-policy-default";

  const systemInventory = buildSystemInventory({ deploymentId });
  const catalog = buildSystemPolicyCatalogManifest();
  const invariants = buildSystemInvariantManifest();
  const constraints = buildSystemMetaConstraintManifest();
  const boundary = buildSystemPolicyBoundaryManifest();
  const refsAligned = isSystemPolicyCatalogRefsAligned();

  const signals: SystemPolicyCatalogSignals = {
    ...DEFAULT_SIGNALS,
    systemInventoryReady: systemInventory.inventoryReady,
    catalogComplete: catalog.catalogComplete,
    invariantsComplete: invariants.catalogComplete,
    constraintsComplete: constraints.catalogComplete,
    boundaryComplete: boundary.boundaryComplete,
    refsAligned,
    freezeVersionDeclared: V80_SYSTEM_POLICY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    systemInventory.inventoryReady &&
    catalog.catalogComplete &&
    invariants.catalogComplete &&
    constraints.catalogComplete &&
    boundary.boundaryComplete &&
    refsAligned &&
    signals.systemInventoryReady !== false &&
    signals.refsAligned !== false;

  return {
    version: V80_SYSTEM_POLICY_VERSION,
    freezeVersion: V80_SYSTEM_POLICY_FREEZE_VERSION,
    reportId: `system-meta-policy-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    systemInventoryVersion: V80_SYSTEM_VERSION,
    systemInventoryReady: systemInventory.inventoryReady,
    catalog,
    invariants,
    constraints,
    boundary,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `system-meta-policy ready=${catalogReady}`,
      `policies=${catalog.entryCount}`,
      `invariants=${invariants.entryCount}`,
      `constraints=${constraints.entryCount}`,
      `boundary=${boundary.boundaryComplete}`,
      `inventory=${systemInventory.inventoryReady}`,
    ].join(" "),
  };
}

export function assertSystemPolicyCatalogPass(
  report: SystemPolicyCatalogReport,
): asserts report is SystemPolicyCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V80 system meta policy not ready: ${report.summary}`);
  }
}
