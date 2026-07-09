/**
 * V78 P1 — Execution inventory entry (read-only)
 */
export {
  EXECUTION_GOVERNANCE_CATALOG,
  EXECUTION_ROLE_CATALOG,
  EXECUTION_TOPOLOGY_CATALOG,
  assertExecutionInventoryPass,
  buildExecutionGovernanceManifest,
  buildExecutionInventory,
  buildExecutionInventoryManifest,
  buildExecutionRoleManifest,
  buildExecutionTopologyManifest,
  getExecutionGovernanceById,
  getExecutionRoleById,
  getExecutionRolesByKind,
  getExecutionTopologyById,
  isExecutionInventoryRefsAligned,
} from "./execution.inventory";
export {
  EXECUTION_UPSTREAM_DEPENDENCIES,
  getExecutionDependenciesByRef,
  getExecutionDependencyById,
  isExecutionUpstreamAligned,
} from "./execution.dependencies";
export {
  EXECUTION_SCOPE_CATALOG,
  buildExecutionScopeManifest,
  getExecutionScopeById,
  getExecutionScopesByKind,
  isExecutionScopeCoverageComplete,
} from "./execution.scope";
export { V78_EXECUTION_FREEZE_VERSION, V78_EXECUTION_VERSION } from "./execution.types";
export type {
  ExecutionAssetStatus,
  ExecutionGovernance,
  ExecutionInventoryManifest,
  ExecutionInventoryReport,
  ExecutionInventorySignals,
  ExecutionRole,
  ExecutionRoleKind,
  ExecutionTopology,
  ExecutionTopologyKind,
} from "./execution.types";
export type { ExecutionUpstreamDependency } from "./execution.dependencies";
export type { ExecutionScope, ExecutionScopeKind } from "./execution.scope";

import { buildExecutionInventory } from "./execution.inventory";
import type { ExecutionInventoryReport, ExecutionInventorySignals } from "./execution.types";

export function runExecutionInventory(input?: {
  deploymentId?: string;
  signals?: ExecutionInventorySignals;
}): ExecutionInventoryReport {
  return buildExecutionInventory(input);
}

export function formatExecutionInventorySummary(report: ExecutionInventoryReport): string {
  const lines = [
    "V78 Execution Inventory",
    `  ready: ${report.inventoryReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  upstream-planning-freeze: ${report.upstreamPlanningFreeze}`,
    `  upstream-planning-signoff: ${report.upstreamPlanningSignoff}`,
    `  roles: ${report.manifest.roles.entryCount}`,
    `  topology: ${report.manifest.topology.entryCount}`,
    `  governance: ${report.manifest.governance.entryCount}`,
  ];
  return lines.join("\n");
}
