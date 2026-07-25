/**
 * Product P11 — Tenant types
 */

import type { TENANT_STATUSES } from "../release/release.constants";

export type TenantStatus = (typeof TENANT_STATUSES)[number];
export type TenantMetadata = Record<string, unknown>;

export type CommercialTenant = {
  id: string;
  releaseId: string;
  slug: string;
  name: string;
  status: TenantStatus;
  detail: string;
  metadata: TenantMetadata;
  provisionedAt: string;
  updatedAt: string;
};

export type ProvisionTenantInput = {
  id?: string;
  releaseId: string;
  slug: string;
  name: string;
  metadata?: TenantMetadata;
};

export type UpdateTenantStatusInput = {
  tenantId: string;
  status: TenantStatus;
};
