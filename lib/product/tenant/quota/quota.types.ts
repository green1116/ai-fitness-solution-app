/**
 * Product Tenant — Quota types
 */

import type { TENANT_QUOTA_RESOURCES } from "../administration/administration.constants";

export type TenantQuotaResource = (typeof TENANT_QUOTA_RESOURCES)[number];
export type QuotaMetadata = Record<string, unknown>;

export type TenantQuota = {
  id: string;
  recordId: string;
  resource: TenantQuotaResource;
  limit: number;
  detail: string;
  metadata: QuotaMetadata;
  setAt: string;
};

export type SetTenantQuotaInput = {
  id?: string;
  recordId: string;
  resource: TenantQuotaResource;
  limit: number;
  metadata?: QuotaMetadata;
};
