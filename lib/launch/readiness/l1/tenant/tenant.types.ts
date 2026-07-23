/**
 * Launch L1 — Tenant types
 */

import type { TENANT_STATUSES } from "../demo/demo.constants";

export type TenantStatus = (typeof TENANT_STATUSES)[number];
export type TenantMetadata = Record<string, unknown>;

export type DemoTenant = {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  region: string;
  detail: string;
  metadata: TenantMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterTenantInput = {
  id?: string;
  name: string;
  slug?: string;
  status?: TenantStatus;
  region?: string;
  metadata?: TenantMetadata;
};
