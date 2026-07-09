/**
 * V79 P1 — Task inventory types (read-only)
 */

export const V79_TASK_VERSION = "v79-task-inventory-1" as const;
export const V79_TASK_FREEZE_VERSION = "v79-task-inventory-freeze-1" as const;

export type TaskAssetStatus = "declared" | "registered" | "active" | "frozen";

export type TaskRoleKind =
  | "creator"
  | "assigner"
  | "executor"
  | "monitor"
  | "coordinator"
  | "governance"
  | "topology"
  | "boundary";

export type TaskRole = {
  id: string;
  name: string;
  kind: TaskRoleKind;
  status: TaskAssetStatus;
  scopeRef: string;
  topologyRef: string;
  executionRef: string;
  required: boolean;
  description: string;
};

export type TaskStateKind =
  | "draft"
  | "pending"
  | "queued"
  | "active"
  | "blocked"
  | "completed"
  | "cancelled"
  | "frozen";

export type TaskState = {
  id: string;
  name: string;
  kind: TaskStateKind;
  status: TaskAssetStatus;
  scopeRef: string;
  roleRef: string;
  transitionRule: string;
  required: boolean;
  description: string;
};

export type TaskTopologyKind =
  | "hub"
  | "node"
  | "edge"
  | "leaf"
  | "boundary"
  | "pipeline"
  | "domain"
  | "global";

export type TaskTopology = {
  id: string;
  name: string;
  kind: TaskTopologyKind;
  status: TaskAssetStatus;
  roleRef: string;
  scopeRef: string;
  dependencyRef: string;
  required: boolean;
  description: string;
};

export type TaskGovernanceKind =
  | "policy"
  | "audit"
  | "compliance"
  | "freeze"
  | "rollback"
  | "version"
  | "scope"
  | "boundary";

export type TaskGovernance = {
  id: string;
  name: string;
  kind: TaskGovernanceKind;
  status: TaskAssetStatus;
  scopeRef: string;
  roleRef: string;
  rule: string;
  required: boolean;
  description: string;
};

export type TaskRoleManifest = {
  version: typeof V79_TASK_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  roles: TaskRole[];
  summary: string;
};

export type TaskStateManifest = {
  version: typeof V79_TASK_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  states: TaskState[];
  summary: string;
};

export type TaskTopologyManifest = {
  version: typeof V79_TASK_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  topology: TaskTopology[];
  summary: string;
};

export type TaskGovernanceManifest = {
  version: typeof V79_TASK_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  governance: TaskGovernance[];
  summary: string;
};

export type TaskInventoryManifest = {
  version: typeof V79_TASK_VERSION;
  roles: TaskRoleManifest;
  states: TaskStateManifest;
  topology: TaskTopologyManifest;
  governance: TaskGovernanceManifest;
  inventoryComplete: boolean;
  summary: string;
};

export type TaskInventorySignals = {
  inventoryComplete?: boolean;
  upstreamAligned?: boolean;
  scopeCoverageComplete?: boolean;
  freezeVersionDeclared?: boolean;
};

export type TaskInventoryReport = {
  version: typeof V79_TASK_VERSION;
  freezeVersion: typeof V79_TASK_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  upstreamExecutionFreeze: string;
  upstreamExecutionSignoff: string;
  manifest: TaskInventoryManifest;
  inventoryReady: boolean;
  readinessScore: number;
  summary: string;
};
