/**
 * E10-P7 — Enterprise Platform OS types
 * Orchestration layer above E10 Platform Marketplace
 */

import type { PlatformMetadata } from "../core/platform.types";
import {
  E10_OS_BASE,
  E10_OS_FREEZE_VERSION,
  E10_OS_ID,
  E10_OS_VERSION,
  OS_COMPONENT_KINDS,
  OS_COMPONENT_STATUSES,
  OS_HEALTH_LEVELS,
  OS_KERNEL_STATUSES,
  OS_MANAGER_STATUSES,
} from "./os.constants";

export type OsComponentKind = (typeof OS_COMPONENT_KINDS)[number];
export type OsComponentStatus = (typeof OS_COMPONENT_STATUSES)[number];
export type OsKernelStatus = (typeof OS_KERNEL_STATUSES)[number];
export type OsManagerStatus = (typeof OS_MANAGER_STATUSES)[number];
export type OsHealthLevel = (typeof OS_HEALTH_LEVELS)[number];

export type { PlatformMetadata };

export type OsComponent = {
  id: string;
  name: string;
  kind: OsComponentKind;
  layerId: string;
  status: OsComponentStatus;
  bootOrder: number;
  metadata: PlatformMetadata;
  registeredAt: string;
  startedAt?: string;
  stoppedAt?: string;
  lastError?: string;
};

export type RegisterOsComponentInput = {
  id: string;
  name: string;
  kind: OsComponentKind;
  layerId: string;
  bootOrder?: number;
  metadata?: PlatformMetadata;
};

export type OsKernelSnapshot = {
  kernelId: string;
  status: OsKernelStatus;
  osId: typeof E10_OS_ID;
  version: typeof E10_OS_VERSION;
  componentCount: number;
  runningCount: number;
  bootedAt?: string;
  stoppedAt?: string;
};

export type OsComponentHealth = {
  componentId: string;
  kind: OsComponentKind;
  level: OsHealthLevel;
  ok: boolean;
  status: OsComponentStatus;
  checks: string[];
  checkedAt: string;
};

export type OsHealthReport = {
  level: OsHealthLevel;
  ok: boolean;
  componentCount: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  components: OsComponentHealth[];
  checkedAt: string;
};

export type OsPlatformStatusSnapshot = {
  osId: typeof E10_OS_ID;
  version: typeof E10_OS_VERSION;
  freezeVersion: typeof E10_OS_FREEZE_VERSION;
  base: typeof E10_OS_BASE;
  managerStatus: OsManagerStatus;
  kernelStatus: OsKernelStatus;
  health: OsHealthReport;
  components: OsComponent[];
  bootOrder: OsComponentKind[];
  snappedAt: string;
};

export type OsRegistryManifest = {
  osId: typeof E10_OS_ID;
  version: typeof E10_OS_VERSION;
  freezeVersion: typeof E10_OS_FREEZE_VERSION;
  base: typeof E10_OS_BASE;
  componentCount: number;
  components: OsComponent[];
};

export type BootResult = {
  kernelStatus: OsKernelStatus;
  started: string[];
  failed: string[];
  order: OsComponentKind[];
  bootedAt: string;
};

export type ShutdownResult = {
  kernelStatus: OsKernelStatus;
  stopped: string[];
  failed: string[];
  order: OsComponentKind[];
  stoppedAt: string;
};
