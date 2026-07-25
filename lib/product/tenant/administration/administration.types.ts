/**
 * Product Tenant — readiness / manifest types
 */

import type {
  PRODUCT_TENANT_ADMINISTRATION_BASE,
  PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION,
  PRODUCT_TENANT_ADMINISTRATION_ID,
  PRODUCT_TENANT_ADMINISTRATION_VERSION,
  TENANT_MANAGER_STATUSES,
  TENANT_READINESS_VERDICTS,
} from "./administration.constants";

export type TenantReadinessVerdict =
  (typeof TENANT_READINESS_VERDICTS)[number];
export type TenantManagerStatus = (typeof TENANT_MANAGER_STATUSES)[number];

export type TenantReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type TenantReadinessResult = {
  verdict: TenantReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: TenantReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type TenantRegistryManifest = {
  administrationId: typeof PRODUCT_TENANT_ADMINISTRATION_ID;
  version: typeof PRODUCT_TENANT_ADMINISTRATION_VERSION;
  freezeVersion: typeof PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION;
  base: typeof PRODUCT_TENANT_ADMINISTRATION_BASE;
  recordCount: number;
  quotaCount: number;
  isolationCount: number;
  lifecycleCount: number;
};
