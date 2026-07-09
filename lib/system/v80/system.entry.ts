/**
 * V80 P1 — System meta-orchestration inventory entry (read-only)
 */
export {
  SYSTEM_GOVERNANCE_CATALOG,
  SYSTEM_ROLE_CATALOG,
  SYSTEM_TOPOLOGY_CATALOG,
  assertSystemInventoryPass,
  buildSystemGovernanceManifest,
  buildSystemInventory,
  buildSystemInventoryManifest,
  buildSystemRoleManifest,
  buildSystemTopologyManifest,
  getSystemGovernanceById,
  getSystemRoleById,
  getSystemRolesByKind,
  getSystemTopologyById,
  isSystemInventoryRefsAligned,
} from "./system.inventory";
export {
  SYSTEM_CROSS_LAYER_MAP,
  getCrossLayerEntry,
  isSystemCrossLayerMapComplete,
} from "./system.crosslayer";
export {
  SYSTEM_STACK_DEPENDENCIES,
  getSystemDependenciesByLayer,
  getSystemDependencyById,
  isSystemStackUpstreamAligned,
} from "./system.dependencies";
export {
  SYSTEM_SCOPE_CATALOG,
  buildSystemScopeManifest,
  getSystemScopeById,
  isSystemScopeCoverageComplete,
} from "./system.scope";
export { V80_SYSTEM_FREEZE_VERSION, V80_SYSTEM_VERSION } from "./system.types";
export type {
  SystemAssetStatus,
  SystemCrossLayerRole,
  SystemCrossLayerRoleKind,
  SystemGovernance,
  SystemInventoryManifest,
  SystemInventoryReport,
  SystemInventorySignals,
  SystemLayerId,
  SystemTopology,
} from "./system.types";
export type { SystemCrossLayerEntry } from "./system.crosslayer";
export type { SystemStackDependency } from "./system.dependencies";
export type { SystemScope, SystemScopeKind } from "./system.scope";

import { buildSystemInventory } from "./system.inventory";
import type { SystemInventoryReport, SystemInventorySignals } from "./system.types";

export function runSystemInventory(input?: {
  deploymentId?: string;
  signals?: SystemInventorySignals;
}): SystemInventoryReport {
  return buildSystemInventory(input);
}

export function formatSystemInventorySummary(report: SystemInventoryReport): string {
  return [
    "V80 System Meta-Orchestration Inventory",
    `  ready: ${report.inventoryReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  stack-layers: ${report.stackLayers.join("→")}`,
    `  roles: ${report.manifest.roles.entryCount}`,
    `  topology: ${report.manifest.topology.entryCount}`,
    `  governance: ${report.manifest.governance.entryCount}`,
  ].join("\n");
}
