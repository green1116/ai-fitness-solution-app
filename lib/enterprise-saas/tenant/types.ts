import type { ENTERPRISE_SAAS_VERSION } from "../shared/types";

export const TENANT_RUNTIME_VERSION = "v10.5-tenant-runtime-1" as const;

export type TenantTier = "trial" | "professional" | "enterprise";

export type TenantStatus = "provisioning" | "active" | "suspended" | "cancelled" | "expired";

export type TenantLifecycleStage =
  | "created"
  | "trial-started"
  | "upgraded"
  | "active"
  | "suspended"
  | "cancelled";

export interface Tenant {
  tenantId: string;
  name: string;
  slug: string;
  tier: TenantTier;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TenantLifecycleEvent {
  eventId: string;
  tenantId: string;
  stage: TenantLifecycleStage;
  occurredAt: string;
  note: string;
}

export interface TenantRuntimePayload {
  version: typeof TENANT_RUNTIME_VERSION;
  saasVersion: typeof ENTERPRISE_SAAS_VERSION;
  tenant: Tenant;
  lifecycle: TenantLifecycleEvent[];
  summary: string;
}
