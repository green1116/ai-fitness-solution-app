export const SAAS_FOUNDATION_VERSION = "v48-saas-foundation-p1" as const;
export const SAAS_P1_TAG = "v48-saas-foundation-p1" as const;

export const SAAS_PORTAL_TYPES = [
  "enterprise",
  "contractor",
  "supplier",
  "manufacturer",
] as const;

export const SAAS_TENANT_STATUSES = ["active", "trial", "suspended", "canceled"] as const;

export const SAAS_ORG_STATUSES = ["active", "inactive"] as const;

export const SAAS_WORKSPACE_STATUSES = ["active", "archived"] as const;

export const SAAS_MEMBERSHIP_STATUSES = ["pending", "active", "removed"] as const;

export const SAAS_SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "paused",
] as const;

export const SAAS_SCHEMA_MODELS = [
  "SaasTenant",
  "SaasOrganization",
  "SaasWorkspace",
  "SaasMembership",
  "SaasRole",
  "SaasPermission",
  "SaasRolePermission",
  "SaasPlan",
  "SaasSubscription",
  "SaasEntitlementGrant",
] as const;

export const FORBIDDEN_V47_IMPORT_PREFIX = "lib/commercial-products/" as const;
