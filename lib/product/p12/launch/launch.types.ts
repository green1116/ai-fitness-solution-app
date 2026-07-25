/**
 * Product P12 — Launch types + readiness / manifest
 */

import type {
  LAUNCH_STATUSES,
  P12_MANAGER_STATUSES,
  P12_READINESS_VERDICTS,
  PRODUCT_P12_PRODUCTION_LAUNCH_BASE,
  PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION,
  PRODUCT_P12_PRODUCTION_LAUNCH_ID,
  PRODUCT_P12_PRODUCTION_LAUNCH_VERSION,
} from "./launch.constants";

export type LaunchStatus = (typeof LAUNCH_STATUSES)[number];
export type P12ReadinessVerdict = (typeof P12_READINESS_VERDICTS)[number];
export type P12ManagerStatus = (typeof P12_MANAGER_STATUSES)[number];
export type LaunchMetadata = Record<string, unknown>;

export type ProductionLaunch = {
  id: string;
  commercialReleaseRef: string;
  name: string;
  owner: string;
  status: LaunchStatus;
  detail: string;
  metadata: LaunchMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateLaunchInput = {
  id?: string;
  commercialReleaseRef: string;
  name: string;
  owner: string;
  metadata?: LaunchMetadata;
};

export type UpdateLaunchStatusInput = {
  launchId: string;
  status: LaunchStatus;
};

export type P12ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P12ReadinessResult = {
  verdict: P12ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P12ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P12RegistryManifest = {
  foundationId: typeof PRODUCT_P12_PRODUCTION_LAUNCH_ID;
  version: typeof PRODUCT_P12_PRODUCTION_LAUNCH_VERSION;
  freezeVersion: typeof PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION;
  base: typeof PRODUCT_P12_PRODUCTION_LAUNCH_BASE;
  launchCount: number;
  readinessCount: number;
  rolloutCount: number;
  adoptionCount: number;
  operationsCount: number;
  monitoringCount: number;
  supportCount: number;
};
