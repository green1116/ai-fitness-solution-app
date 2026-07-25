/**
 * Product Tenant — Isolation types
 */

import type { TENANT_ISOLATION_MODES } from "../administration/administration.constants";

export type TenantIsolationMode = (typeof TENANT_ISOLATION_MODES)[number];
export type IsolationMetadata = Record<string, unknown>;

export type TenantIsolation = {
  id: string;
  recordId: string;
  mode: TenantIsolationMode;
  region: string;
  detail: string;
  metadata: IsolationMetadata;
  configuredAt: string;
};

export type ConfigureTenantIsolationInput = {
  id?: string;
  recordId: string;
  mode: TenantIsolationMode;
  region: string;
  metadata?: IsolationMetadata;
};
