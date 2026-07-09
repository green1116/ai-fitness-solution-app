/**
 * V80 P2 — System meta policy entry (read-only)
 */
export {
  SYSTEM_POLICY_CATALOG,
  buildSystemPolicyCatalogManifest,
  computeSystemDeclarativePolicyBlock,
  getSystemPoliciesByKind,
  getSystemPolicyById,
  isSystemPolicyCatalogRefsAligned,
} from "./system.policy.catalog";
export {
  SYSTEM_INVARIANT_CATALOG,
  buildSystemInvariantManifest,
  getSystemInvariantById,
  isSystemInvariantCatalogComplete,
} from "./system.invariant.catalog";
export {
  SYSTEM_META_CONSTRAINT_CATALOG,
  buildSystemMetaConstraintManifest,
  getSystemMetaConstraintById,
  isSystemMetaConstraintCatalogComplete,
} from "./system.constraint.catalog";
export {
  SYSTEM_POLICY_SCOPE_BOUNDARIES,
  buildSystemPolicyBoundaryManifest,
  getSystemPolicyScopeBoundaryByZone,
  isSystemPolicyBoundaryComplete,
} from "./system.policy.boundary";
export { assertSystemPolicyCatalogPass, buildSystemPolicyCatalog } from "./system.policy.builder";
export { V80_SYSTEM_POLICY_FREEZE_VERSION, V80_SYSTEM_POLICY_VERSION } from "./system.policy";
export type {
  SystemInvariant,
  SystemMetaConstraint,
  SystemPolicyCatalogReport,
  SystemPolicyCatalogSignals,
  SystemPolicyEntry,
  SystemPolicyKind,
  SystemPolicyScopeBoundary,
} from "./system.policy";

import { buildSystemPolicyCatalog } from "./system.policy.builder";
import type { SystemPolicyCatalogReport, SystemPolicyCatalogSignals } from "./system.policy";

export function runSystemPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: SystemPolicyCatalogSignals;
}): SystemPolicyCatalogReport {
  return buildSystemPolicyCatalog(input);
}

export function formatSystemPolicyCatalogSummary(report: SystemPolicyCatalogReport): string {
  return [
    "V80 System Meta Policy",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  inventory: ${report.systemInventoryVersion} (ready=${report.systemInventoryReady})`,
    `  policies: ${report.catalog.entryCount}`,
    `  invariants: ${report.invariants.entryCount}`,
    `  constraints: ${report.constraints.entryCount}`,
    `  boundary-zones: ${report.boundary.zoneCount}`,
  ].join("\n");
}
