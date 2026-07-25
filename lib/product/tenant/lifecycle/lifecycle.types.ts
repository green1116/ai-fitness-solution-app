/**
 * Product Tenant — Lifecycle types
 */

import type { TENANT_LIFECYCLE_STATES } from "../administration/administration.constants";

export type TenantLifecycleState = (typeof TENANT_LIFECYCLE_STATES)[number];
export type LifecycleMetadata = Record<string, unknown>;

export type TenantLifecycle = {
  id: string;
  recordId: string;
  state: TenantLifecycleState;
  detail: string;
  metadata: LifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateTenantLifecycleInput = {
  id?: string;
  recordId: string;
  metadata?: LifecycleMetadata;
};

export type TransitionTenantLifecycleInput = {
  lifecycleId: string;
  state: TenantLifecycleState;
};
