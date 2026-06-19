import type {
  SAAS_MEMBERSHIP_STATUSES,
  SAAS_PORTAL_TYPES,
  SAAS_SUBSCRIPTION_STATUSES,
  SAAS_TENANT_STATUSES,
} from "./constants";

export type SaasPortalType = (typeof SAAS_PORTAL_TYPES)[number];
export type SaasTenantStatus = (typeof SAAS_TENANT_STATUSES)[number];
export type SaasMembershipStatus = (typeof SAAS_MEMBERSHIP_STATUSES)[number];
export type SaasSubscriptionStatus = (typeof SAAS_SUBSCRIPTION_STATUSES)[number];

export interface SaasPermissionDefinition {
  key: string;
  resource: string;
  action: string;
  description: string;
}

export interface SaasSystemRoleDefinition {
  systemCode: string;
  name: string;
  scope: "tenant" | "organization" | "workspace";
  portalType: SaasPortalType;
  permissionKeys: string[];
}

export interface SaasPlanDefinition {
  code: string;
  name: string;
  priceMonthly: number;
  features: Record<string, boolean>;
  quotas: Record<string, number>;
}

export interface SaasSeedResult {
  idempotent: boolean;
  permissionCount: number;
  roleCount: number;
  planCount: number;
  rolePermissionCount: number;
  summary: string;
}

export interface SaasFixtureChain {
  tenantId: string;
  organizationId: string;
  workspaceId: string;
  userId: string;
  membershipId: string;
  subscriptionId: string;
  grantId: string;
}

export interface SaasFoundationP1Validation {
  valid: boolean;
  version: typeof import("./constants").SAAS_FOUNDATION_VERSION;
  permissionCount: number;
  roleSystemCodes: string[];
  planCodes: string[];
  schemaModels: readonly string[];
  boundaryClean: boolean;
  summary: string;
}
