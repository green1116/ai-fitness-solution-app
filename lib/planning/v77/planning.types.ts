/**
 * V77 P1 — Planning inventory types (read-only)
 */

export const V77_PLANNING_VERSION = "v77-planning-inventory-1" as const;
export const V77_PLANNING_FREEZE_VERSION = "v77-planning-inventory-freeze-1" as const;

export type PlanningAssetStatus = "declared" | "registered" | "active" | "frozen";

export type PlanningRoleKind =
  | "planner"
  | "coordinator"
  | "executor"
  | "reviewer"
  | "delegator"
  | "governance"
  | "topology"
  | "workspace";

export type PlanningRole = {
  id: string;
  name: string;
  kind: PlanningRoleKind;
  status: PlanningAssetStatus;
  scopeRef: string;
  topologyRef: string;
  collaborationRef: string;
  required: boolean;
  description: string;
};

export type PlanningTopologyKind =
  | "hub"
  | "node"
  | "edge"
  | "leaf"
  | "boundary"
  | "session"
  | "domain"
  | "global";

export type PlanningTopology = {
  id: string;
  name: string;
  kind: PlanningTopologyKind;
  status: PlanningAssetStatus;
  roleRef: string;
  scopeRef: string;
  dependencyRef: string;
  required: boolean;
  description: string;
};

export type PlanningGovernanceKind =
  | "policy"
  | "audit"
  | "compliance"
  | "freeze"
  | "rollback"
  | "version"
  | "scope"
  | "boundary";

export type PlanningGovernance = {
  id: string;
  name: string;
  kind: PlanningGovernanceKind;
  status: PlanningAssetStatus;
  scopeRef: string;
  roleRef: string;
  rule: string;
  required: boolean;
  description: string;
};

export type PlanningRoleManifest = {
  version: typeof V77_PLANNING_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  roles: PlanningRole[];
  summary: string;
};

export type PlanningTopologyManifest = {
  version: typeof V77_PLANNING_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  topology: PlanningTopology[];
  summary: string;
};

export type PlanningGovernanceManifest = {
  version: typeof V77_PLANNING_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  governance: PlanningGovernance[];
  summary: string;
};

export type PlanningInventoryManifest = {
  version: typeof V77_PLANNING_VERSION;
  roles: PlanningRoleManifest;
  topology: PlanningTopologyManifest;
  governance: PlanningGovernanceManifest;
  inventoryComplete: boolean;
  summary: string;
};

export type PlanningInventorySignals = {
  inventoryComplete?: boolean;
  upstreamAligned?: boolean;
  scopeCoverageComplete?: boolean;
  freezeVersionDeclared?: boolean;
};

export type PlanningInventoryReport = {
  version: typeof V77_PLANNING_VERSION;
  freezeVersion: typeof V77_PLANNING_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  upstreamCollaborationFreeze: string;
  upstreamCollaborationSignoff: string;
  manifest: PlanningInventoryManifest;
  inventoryReady: boolean;
  readinessScore: number;
  summary: string;
};
