/**
 * E10-P1 — Platform Foundation types
 * Platform kernel above E09 Global Autonomous Enterprise Network
 */

import {
  E10_PLATFORM_BASE,
  E10_PLATFORM_FREEZE_VERSION,
  E10_PLATFORM_ID,
  E10_PLATFORM_VERSION,
  PLATFORM_LIFECYCLE_STAGES,
  PLATFORM_MODULE_KINDS,
  PLATFORM_MODULE_STATUSES,
  PLATFORM_RUNTIME_STATUSES,
} from "./platform.constants";

export type PlatformModuleKind = (typeof PLATFORM_MODULE_KINDS)[number];
export type PlatformModuleStatus = (typeof PLATFORM_MODULE_STATUSES)[number];
export type PlatformLifecycleStage =
  (typeof PLATFORM_LIFECYCLE_STAGES)[number];
export type PlatformRuntimeStatus =
  (typeof PLATFORM_RUNTIME_STATUSES)[number];

export type PlatformMetadata = Record<string, unknown>;

export type PlatformModule = {
  id: string;
  name: string;
  kind: PlatformModuleKind;
  status: PlatformModuleStatus;
  version: string;
  metadata: PlatformMetadata;
};

export type RegisterPlatformModuleInput = {
  id: string;
  name: string;
  kind: PlatformModuleKind;
  status?: PlatformModuleStatus;
  version?: string;
  metadata?: PlatformMetadata;
};

export type PlatformLifecycleTransition = {
  from: PlatformLifecycleStage;
  to: PlatformLifecycleStage;
  at: string;
  note?: string;
};

export type PlatformModuleLifecycle = {
  moduleId: string;
  current: PlatformLifecycleStage;
  stages: PlatformLifecycleStage[];
  transitions: PlatformLifecycleTransition[];
};

export type PlatformRegistryManifest = {
  platformId: typeof E10_PLATFORM_ID;
  version: typeof E10_PLATFORM_VERSION;
  freezeVersion: typeof E10_PLATFORM_FREEZE_VERSION;
  base: typeof E10_PLATFORM_BASE;
  moduleCount: number;
  modules: PlatformModule[];
};

export type PlatformFoundationResult = {
  platformId: typeof E10_PLATFORM_ID;
  version: typeof E10_PLATFORM_VERSION;
  freezeVersion: typeof E10_PLATFORM_FREEZE_VERSION;
  base: typeof E10_PLATFORM_BASE;
  registry: PlatformRegistryManifest;
  ready: boolean;
  summary: string;
};

export type PlatformInfo = {
  platformId: typeof E10_PLATFORM_ID;
  version: typeof E10_PLATFORM_VERSION;
  freezeVersion: typeof E10_PLATFORM_FREEZE_VERSION;
  base: typeof E10_PLATFORM_BASE;
  name: string;
  description: string;
};
