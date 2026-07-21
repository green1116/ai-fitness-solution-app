/**
 * E11-P1 — Cloud Runtime Foundation types
 * Cloud runtime layer above E10 Autonomous Platform
 */

import {
  CLOUD_CONTEXT_STATUSES,
  CLOUD_HEALTH_LEVELS,
  CLOUD_LIFECYCLE_STAGES,
  CLOUD_MANAGER_STATUSES,
  CLOUD_RUNTIME_KINDS,
  CLOUD_RUNTIME_STATUSES,
  E11_CLOUD_RUNTIME_BASE,
  E11_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_CLOUD_RUNTIME_ID,
  E11_CLOUD_RUNTIME_VERSION,
} from "../core/cloud.constants";

export type CloudRuntimeKind = (typeof CLOUD_RUNTIME_KINDS)[number];
export type CloudRuntimeStatus = (typeof CLOUD_RUNTIME_STATUSES)[number];
export type CloudLifecycleStage = (typeof CLOUD_LIFECYCLE_STAGES)[number];
export type CloudManagerStatus = (typeof CLOUD_MANAGER_STATUSES)[number];
export type CloudHealthLevel = (typeof CLOUD_HEALTH_LEVELS)[number];
export type CloudContextStatus = (typeof CLOUD_CONTEXT_STATUSES)[number];

export type CloudMetadata = Record<string, unknown>;

/** Registered cloud runtime instance. */
export type CloudRuntimeRecord = {
  id: string;
  name: string;
  kind: CloudRuntimeKind;
  status: CloudRuntimeStatus;
  version: string;
  region?: string;
  metadata: CloudMetadata;
  registeredAt: string;
};

export type RegisterCloudRuntimeInput = {
  id: string;
  name: string;
  kind: CloudRuntimeKind;
  status?: CloudRuntimeStatus;
  version?: string;
  region?: string;
  metadata?: CloudMetadata;
};

export type CloudLifecycleTransition = {
  from: CloudLifecycleStage;
  to: CloudLifecycleStage;
  at: string;
  note?: string;
};

export type CloudRuntimeLifecycle = {
  runtimeId: string;
  current: CloudLifecycleStage;
  stages: CloudLifecycleStage[];
  transitions: CloudLifecycleTransition[];
};

/** Execution context bound to a registered runtime. */
export type CloudExecutionContext = {
  contextId: string;
  runtimeId: string;
  status: CloudContextStatus;
  correlationId?: string;
  attributes: CloudMetadata;
  openedAt: string;
  closedAt?: string;
};

export type OpenCloudContextInput = {
  runtimeId: string;
  contextId?: string;
  correlationId?: string;
  attributes?: CloudMetadata;
};

export type CloudHealthReport = {
  runtimeId: string;
  level: CloudHealthLevel;
  ok: boolean;
  status: CloudRuntimeStatus;
  checks: string[];
  checkedAt: string;
};

export type CloudStatusSnapshot = {
  cloudId: typeof E11_CLOUD_RUNTIME_ID;
  version: typeof E11_CLOUD_RUNTIME_VERSION;
  freezeVersion: typeof E11_CLOUD_RUNTIME_FREEZE_VERSION;
  base: typeof E11_CLOUD_RUNTIME_BASE;
  managerStatus: CloudManagerStatus;
  runtimeCount: number;
  activeCount: number;
  contextCount: number;
  health: {
    level: CloudHealthLevel;
    ok: boolean;
    healthyCount: number;
    degradedCount: number;
    unhealthyCount: number;
  };
  snappedAt: string;
};

export type CloudRegistryManifest = {
  cloudId: typeof E11_CLOUD_RUNTIME_ID;
  version: typeof E11_CLOUD_RUNTIME_VERSION;
  freezeVersion: typeof E11_CLOUD_RUNTIME_FREEZE_VERSION;
  base: typeof E11_CLOUD_RUNTIME_BASE;
  runtimeCount: number;
  runtimes: CloudRuntimeRecord[];
};

export type CloudFoundationResult = {
  cloudId: typeof E11_CLOUD_RUNTIME_ID;
  version: typeof E11_CLOUD_RUNTIME_VERSION;
  freezeVersion: typeof E11_CLOUD_RUNTIME_FREEZE_VERSION;
  base: typeof E11_CLOUD_RUNTIME_BASE;
  registry: CloudRegistryManifest;
  ready: boolean;
  summary: string;
};

export type CloudRuntimeInfo = {
  cloudId: typeof E11_CLOUD_RUNTIME_ID;
  version: typeof E11_CLOUD_RUNTIME_VERSION;
  freezeVersion: typeof E11_CLOUD_RUNTIME_FREEZE_VERSION;
  base: typeof E11_CLOUD_RUNTIME_BASE;
  name: string;
  description: string;
};
