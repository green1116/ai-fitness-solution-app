/**
 * Product Metering — readiness / manifest types
 */

import type {
  METERING_MANAGER_STATUSES,
  METERING_READINESS_VERDICTS,
  PRODUCT_USAGE_METERING_BASE,
  PRODUCT_USAGE_METERING_FREEZE_VERSION,
  PRODUCT_USAGE_METERING_ID,
  PRODUCT_USAGE_METERING_VERSION,
} from "./usage.constants";

export type MeteringReadinessVerdict =
  (typeof METERING_READINESS_VERDICTS)[number];
export type MeteringManagerStatus =
  (typeof METERING_MANAGER_STATUSES)[number];

export type MeteringReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type MeteringReadinessResult = {
  verdict: MeteringReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: MeteringReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type MeteringRegistryManifest = {
  foundationId: typeof PRODUCT_USAGE_METERING_ID;
  version: typeof PRODUCT_USAGE_METERING_VERSION;
  freezeVersion: typeof PRODUCT_USAGE_METERING_FREEZE_VERSION;
  base: typeof PRODUCT_USAGE_METERING_BASE;
  meterCount: number;
  eventCount: number;
  aggregateCount: number;
  ratingCount: number;
};
