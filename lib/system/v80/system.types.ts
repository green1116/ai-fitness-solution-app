/**
 * V80 P1 — System meta-orchestration inventory types (read-only)
 */

export const V80_SYSTEM_VERSION = "v80-system-meta-inventory-1" as const;
export const V80_SYSTEM_FREEZE_VERSION = "v80-system-meta-inventory-freeze-1" as const;

export type SystemLayerId = "V76" | "V77" | "V78" | "V79" | "V80";

export type SystemAssetStatus = "declared" | "registered" | "active" | "frozen";

export type SystemCrossLayerRoleKind =
  | "collaboration"
  | "planning"
  | "execution"
  | "task"
  | "meta"
  | "coordinator"
  | "governance"
  | "boundary";

export type SystemCrossLayerRole = {
  id: string;
  name: string;
  kind: SystemCrossLayerRoleKind;
  layerRef: SystemLayerId;
  status: SystemAssetStatus;
  scopeRef: string;
  topologyRef: string;
  layerSignoffRef: string;
  required: boolean;
  description: string;
};

export type SystemTopologyKind =
  | "global"
  | "hub"
  | "node"
  | "edge"
  | "leaf"
  | "pipeline"
  | "domain"
  | "boundary";

export type SystemTopology = {
  id: string;
  name: string;
  kind: SystemTopologyKind;
  status: SystemAssetStatus;
  layerRef: SystemLayerId;
  roleRef: string;
  scopeRef: string;
  dependencyRef: string;
  required: boolean;
  description: string;
};

export type SystemGovernanceKind =
  | "freeze"
  | "audit"
  | "compliance"
  | "policy"
  | "rollback"
  | "version"
  | "scope"
  | "boundary";

export type SystemGovernance = {
  id: string;
  name: string;
  kind: SystemGovernanceKind;
  status: SystemAssetStatus;
  scopeRef: string;
  roleRef: string;
  rule: string;
  required: boolean;
  description: string;
};

export type SystemRoleManifest = {
  version: typeof V80_SYSTEM_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  roles: SystemCrossLayerRole[];
  summary: string;
};

export type SystemTopologyManifest = {
  version: typeof V80_SYSTEM_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  topology: SystemTopology[];
  summary: string;
};

export type SystemGovernanceManifest = {
  version: typeof V80_SYSTEM_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  governance: SystemGovernance[];
  summary: string;
};

export type SystemInventoryManifest = {
  version: typeof V80_SYSTEM_VERSION;
  roles: SystemRoleManifest;
  topology: SystemTopologyManifest;
  governance: SystemGovernanceManifest;
  inventoryComplete: boolean;
  summary: string;
};

export type SystemInventorySignals = {
  inventoryComplete?: boolean;
  upstreamAligned?: boolean;
  scopeCoverageComplete?: boolean;
  crossLayerMapComplete?: boolean;
  freezeVersionDeclared?: boolean;
};

export type SystemInventoryReport = {
  version: typeof V80_SYSTEM_VERSION;
  freezeVersion: typeof V80_SYSTEM_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  stackLayers: SystemLayerId[];
  manifest: SystemInventoryManifest;
  inventoryReady: boolean;
  readinessScore: number;
  summary: string;
};
