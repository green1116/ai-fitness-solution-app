/**
 * E11-P3 — Multi-Tenant Isolation types
 */

import type { CloudMetadata } from "../types/cloud.types";
import {
  E11_TENANT_BASE,
  E11_TENANT_FREEZE_VERSION,
  E11_TENANT_ID,
  E11_TENANT_VERSION,
  ISOLATION_POLICY_MODES,
  ORGANIZATION_STATUSES,
  ROUTE_DECISIONS,
  TENANT_MANAGER_STATUSES,
  TENANT_QUOTA_TYPES,
  TENANT_STATUSES,
} from "./tenant.constants";

export type TenantStatus = (typeof TENANT_STATUSES)[number];
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];
export type TenantQuotaType = (typeof TENANT_QUOTA_TYPES)[number];
export type IsolationPolicyMode = (typeof ISOLATION_POLICY_MODES)[number];
export type TenantManagerStatus = (typeof TENANT_MANAGER_STATUSES)[number];
export type RouteDecision = (typeof ROUTE_DECISIONS)[number];

export type { CloudMetadata };

/** Organization isolation boundary. */
export type Organization = {
  id: string;
  name: string;
  status: OrganizationStatus;
  metadata: CloudMetadata;
  createdAt: string;
};

export type RegisterOrganizationInput = {
  id: string;
  name: string;
  metadata?: CloudMetadata;
};

/** Tenant runtime namespace. */
export type TenantNamespace = {
  id: string;
  name: string;
  organizationId: string;
  status: TenantStatus;
  /** Bound cloud runtime ids (from registry). */
  runtimeIds: string[];
  namespaceKey: string;
  metadata: CloudMetadata;
  createdAt: string;
};

export type RegisterTenantInput = {
  id: string;
  name: string;
  organizationId: string;
  namespaceKey?: string;
  metadata?: CloudMetadata;
};

/** Per-tenant resource quota. */
export type TenantQuota = {
  id: string;
  tenantId: string;
  type: TenantQuotaType;
  limit: number;
  used: number;
  metadata: CloudMetadata;
};

export type CreateTenantQuotaInput = {
  id?: string;
  tenantId: string;
  type: TenantQuotaType;
  limit: number;
  metadata?: CloudMetadata;
};

/** Isolation policy for a tenant or organization. */
export type IsolationPolicy = {
  id: string;
  tenantId: string;
  mode: IsolationPolicyMode;
  /** Deny cross-tenant runtime binding when true. */
  denyCrossTenant: boolean;
  /** Require organization match for route when true. */
  requireOrgMatch: boolean;
  allowedRuntimeKinds: string[];
  metadata: CloudMetadata;
  createdAt: string;
};

export type CreateIsolationPolicyInput = {
  id?: string;
  tenantId: string;
  mode?: IsolationPolicyMode;
  denyCrossTenant?: boolean;
  requireOrgMatch?: boolean;
  allowedRuntimeKinds?: string[];
  metadata?: CloudMetadata;
};

/** Tenant runtime route request / result. */
export type TenantRouteRequest = {
  tenantId: string;
  runtimeId: string;
  organizationId?: string;
  /** Optional quota type to consume (default TASK). */
  quotaType?: TenantQuotaType;
  /** Amount to reserve (default 1). */
  amount?: number;
};

export type TenantRouteResult = {
  decision: RouteDecision;
  tenantId: string;
  runtimeId: string;
  namespaceKey?: string;
  reason: string;
  routedAt: string;
};

export type TenantRegistryManifest = {
  tenantId: typeof E11_TENANT_ID;
  version: typeof E11_TENANT_VERSION;
  freezeVersion: typeof E11_TENANT_FREEZE_VERSION;
  base: typeof E11_TENANT_BASE;
  organizationCount: number;
  tenantCount: number;
  quotaCount: number;
  policyCount: number;
};
