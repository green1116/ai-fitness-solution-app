/**
 * Product P2 — Organization Workspace constants
 * BASE: enterprise-product-p1-customer-onboarding-v1
 * Isolated namespace: lib/product/p2
 */

export const PRODUCT_P2_ORGANIZATION_WORKSPACE_ID =
  "enterprise-product-p2-organization-workspace-v1" as const;

export const PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION =
  "product-p2-1" as const;

export const PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION =
  "product-p2-organization-workspace-freeze-1" as const;

export const PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE =
  "enterprise-product-p1-customer-onboarding-v1" as const;

export const PRODUCT_P2_ORGANIZATION_FREEZE_VERSION =
  "product-p2-organization-workspace-freeze-1" as const;

export const ORGANIZATION_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const DEPARTMENT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export const MEMBER_STATUSES = [
  "INVITED",
  "ACTIVE",
  "SUSPENDED",
  "REMOVED",
] as const;

export const ROLE_KINDS = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "MEMBER",
  "VIEWER",
] as const;

export const PERMISSION_SCOPES = [
  "ORG",
  "DEPARTMENT",
  "WORKSPACE",
  "MEMBER",
] as const;

export const WORKSPACE_STATUSES = [
  "PENDING",
  "READY",
  "LIVE",
  "ARCHIVED",
] as const;

export const INVITATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "EXPIRED",
  "REVOKED",
] as const;

export const P2_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P2_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
