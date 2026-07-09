/**
 * V77 P1 — Planning inventory entry (read-only)
 */
export {
  PLANNING_GOVERNANCE_CATALOG,
  PLANNING_ROLE_CATALOG,
  PLANNING_TOPOLOGY_CATALOG,
  assertPlanningInventoryPass,
  buildPlanningGovernanceManifest,
  buildPlanningInventory,
  buildPlanningInventoryManifest,
  buildPlanningRoleManifest,
  buildPlanningTopologyManifest,
  getPlanningGovernanceById,
  getPlanningRoleById,
  getPlanningRolesByKind,
  getPlanningTopologyById,
  isPlanningInventoryRefsAligned,
} from "./planning.inventory";
export {
  PLANNING_UPSTREAM_DEPENDENCIES,
  getPlanningDependenciesByRef,
  getPlanningDependencyById,
  isPlanningUpstreamAligned,
} from "./planning.dependencies";
export {
  PLANNING_SCOPE_CATALOG,
  buildPlanningScopeManifest,
  getPlanningScopeById,
  getPlanningScopesByKind,
  isPlanningScopeCoverageComplete,
} from "./planning.scope";
export { V77_PLANNING_FREEZE_VERSION, V77_PLANNING_VERSION } from "./planning.types";
export type {
  PlanningAssetStatus,
  PlanningGovernance,
  PlanningInventoryManifest,
  PlanningInventoryReport,
  PlanningInventorySignals,
  PlanningRole,
  PlanningRoleKind,
  PlanningTopology,
  PlanningTopologyKind,
} from "./planning.types";
export type { PlanningUpstreamDependency } from "./planning.dependencies";
export type { PlanningScope, PlanningScopeKind } from "./planning.scope";

import { buildPlanningInventory } from "./planning.inventory";
import type { PlanningInventoryReport, PlanningInventorySignals } from "./planning.types";

export function runPlanningInventory(input?: {
  deploymentId?: string;
  signals?: PlanningInventorySignals;
}): PlanningInventoryReport {
  return buildPlanningInventory(input);
}

export function formatPlanningInventorySummary(report: PlanningInventoryReport): string {
  const lines = [
    "V77 Planning Inventory",
    `  ready: ${report.inventoryReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  upstream-collaboration-freeze: ${report.upstreamCollaborationFreeze}`,
    `  upstream-collaboration-signoff: ${report.upstreamCollaborationSignoff}`,
    `  roles: ${report.manifest.roles.entryCount}`,
    `  topology: ${report.manifest.topology.entryCount}`,
    `  governance: ${report.manifest.governance.entryCount}`,
  ];
  return lines.join("\n");
}
