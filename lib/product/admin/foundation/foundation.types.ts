/**
 * Product Admin — readiness / manifest types
 */

import type {
  ADMIN_MANAGER_STATUSES,
  ADMIN_READINESS_VERDICTS,
  PRODUCT_ADMIN_FOUNDATION_BASE,
  PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ADMIN_FOUNDATION_ID,
  PRODUCT_ADMIN_FOUNDATION_VERSION,
} from "./foundation.constants";

export type AdminReadinessVerdict =
  (typeof ADMIN_READINESS_VERDICTS)[number];
export type AdminManagerStatus = (typeof ADMIN_MANAGER_STATUSES)[number];

export type AdminReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AdminReadinessResult = {
  verdict: AdminReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AdminReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AdminRegistryManifest = {
  foundationId: typeof PRODUCT_ADMIN_FOUNDATION_ID;
  version: typeof PRODUCT_ADMIN_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_ADMIN_FOUNDATION_BASE;
  tenantCount: number;
  settingCount: number;
  operatorCount: number;
  policyCount: number;
};
