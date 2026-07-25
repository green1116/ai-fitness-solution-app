/**
 * Product SSO — Enterprise SSO Federation constants
 * MODULE: SSO
 * BASE: enterprise-product-mfa-security-v1
 * Isolated namespace: lib/product/sso
 */

export const PRODUCT_SSO_FEDERATION_ID =
  "enterprise-product-sso-federation-v1" as const;

export const PRODUCT_SSO_FEDERATION_VERSION =
  "product-sso-1" as const;

export const PRODUCT_SSO_FEDERATION_FREEZE_VERSION =
  "product-sso-federation-freeze-1" as const;

export const PRODUCT_SSO_FEDERATION_BASE =
  "enterprise-product-mfa-security-v1" as const;

export const PRODUCT_SSO_FREEZE_VERSION =
  "product-sso-federation-freeze-1" as const;

export const SSO_PROVIDER_PROTOCOLS = [
  "SAML",
  "OIDC",
  "OAUTH2",
] as const;

export const SSO_PROVIDER_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DISABLED",
] as const;

export const SSO_CONNECTION_STATUSES = [
  "PENDING",
  "LINKED",
  "REVOKED",
] as const;

export const SSO_ASSERTION_RESULTS = [
  "ACCEPT",
  "REJECT",
] as const;

export const SSO_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const SSO_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
