/**
 * E10-P2 — Platform Runtime types
 * Runtime layer above E10 Platform Foundation
 */

import type { PlatformMetadata } from "../core/platform.types";
import {
  E10_RUNTIME_BASE,
  E10_RUNTIME_FREEZE_VERSION,
  E10_RUNTIME_ID,
  E10_RUNTIME_VERSION,
  RUNTIME_HEALTH_LEVELS,
  RUNTIME_MANAGER_STATUSES,
  RUNTIME_SERVICE_KINDS,
  RUNTIME_SERVICE_STATUSES,
} from "./runtime.constants";

export type RuntimeServiceKind = (typeof RUNTIME_SERVICE_KINDS)[number];
export type RuntimeServiceStatus =
  (typeof RUNTIME_SERVICE_STATUSES)[number];
export type RuntimeManagerStatus =
  (typeof RUNTIME_MANAGER_STATUSES)[number];
export type RuntimeHealthLevel = (typeof RUNTIME_HEALTH_LEVELS)[number];

export type { PlatformMetadata };

export type RuntimeService = {
  id: string;
  name: string;
  kind: RuntimeServiceKind;
  status: RuntimeServiceStatus;
  version: string;
  /** Optional binding to E10-P1 platform module id */
  moduleId?: string;
  startedAt?: string;
  stoppedAt?: string;
  metadata: PlatformMetadata;
};

export type RegisterRuntimeServiceInput = {
  id: string;
  name: string;
  kind: RuntimeServiceKind;
  version?: string;
  moduleId?: string;
  metadata?: PlatformMetadata;
};

export type RuntimeHealthReport = {
  serviceId: string;
  level: RuntimeHealthLevel;
  ok: boolean;
  checks: string[];
  checkedAt: string;
};

export type RuntimeMetricsSnapshot = {
  runtimeId: string;
  managerStatus: RuntimeManagerStatus;
  serviceCount: number;
  runningCount: number;
  failedCount: number;
  stoppedCount: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  capturedAt: string;
};

export type RuntimeRegistryManifest = {
  runtimeId: typeof E10_RUNTIME_ID;
  version: typeof E10_RUNTIME_VERSION;
  freezeVersion: typeof E10_RUNTIME_FREEZE_VERSION;
  base: typeof E10_RUNTIME_BASE;
  serviceCount: number;
  services: RuntimeService[];
};
