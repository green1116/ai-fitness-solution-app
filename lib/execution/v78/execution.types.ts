/**
 * V78 P1 — Execution inventory types (read-only)
 */

export const V78_EXECUTION_VERSION = "v78-execution-inventory-1" as const;
export const V78_EXECUTION_FREEZE_VERSION = "v78-execution-inventory-freeze-1" as const;

export type ExecutionAssetStatus = "declared" | "registered" | "active" | "frozen";

export type ExecutionRoleKind =
  | "executor"
  | "dispatcher"
  | "runner"
  | "monitor"
  | "coordinator"
  | "governance"
  | "topology"
  | "workspace";

export type ExecutionRole = {
  id: string;
  name: string;
  kind: ExecutionRoleKind;
  status: ExecutionAssetStatus;
  scopeRef: string;
  topologyRef: string;
  planningRef: string;
  required: boolean;
  description: string;
};

export type ExecutionTopologyKind =
  | "hub"
  | "node"
  | "edge"
  | "leaf"
  | "boundary"
  | "session"
  | "domain"
  | "global";

export type ExecutionTopology = {
  id: string;
  name: string;
  kind: ExecutionTopologyKind;
  status: ExecutionAssetStatus;
  roleRef: string;
  scopeRef: string;
  dependencyRef: string;
  required: boolean;
  description: string;
};

export type ExecutionGovernanceKind =
  | "policy"
  | "audit"
  | "compliance"
  | "freeze"
  | "rollback"
  | "version"
  | "scope"
  | "boundary";

export type ExecutionGovernance = {
  id: string;
  name: string;
  kind: ExecutionGovernanceKind;
  status: ExecutionAssetStatus;
  scopeRef: string;
  roleRef: string;
  rule: string;
  required: boolean;
  description: string;
};

export type ExecutionRoleManifest = {
  version: typeof V78_EXECUTION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  roles: ExecutionRole[];
  summary: string;
};

export type ExecutionTopologyManifest = {
  version: typeof V78_EXECUTION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  topology: ExecutionTopology[];
  summary: string;
};

export type ExecutionGovernanceManifest = {
  version: typeof V78_EXECUTION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  governance: ExecutionGovernance[];
  summary: string;
};

export type ExecutionInventoryManifest = {
  version: typeof V78_EXECUTION_VERSION;
  roles: ExecutionRoleManifest;
  topology: ExecutionTopologyManifest;
  governance: ExecutionGovernanceManifest;
  inventoryComplete: boolean;
  summary: string;
};

export type ExecutionInventorySignals = {
  inventoryComplete?: boolean;
  upstreamAligned?: boolean;
  scopeCoverageComplete?: boolean;
  freezeVersionDeclared?: boolean;
};

export type ExecutionInventoryReport = {
  version: typeof V78_EXECUTION_VERSION;
  freezeVersion: typeof V78_EXECUTION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  upstreamPlanningFreeze: string;
  upstreamPlanningSignoff: string;
  manifest: ExecutionInventoryManifest;
  inventoryReady: boolean;
  readinessScore: number;
  summary: string;
};
