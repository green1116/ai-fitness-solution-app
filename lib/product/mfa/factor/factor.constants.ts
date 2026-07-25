/**
 * Product MFA — Multi-Factor Authentication constants
 * MODULE: MFA
 * BASE: enterprise-product-session-control-v1
 * Isolated namespace: lib/product/mfa
 */

export const PRODUCT_MFA_SECURITY_ID =
  "enterprise-product-mfa-security-v1" as const;

export const PRODUCT_MFA_SECURITY_VERSION =
  "product-mfa-1" as const;

export const PRODUCT_MFA_SECURITY_FREEZE_VERSION =
  "product-mfa-security-freeze-1" as const;

export const PRODUCT_MFA_SECURITY_BASE =
  "enterprise-product-session-control-v1" as const;

export const PRODUCT_MFA_FREEZE_VERSION =
  "product-mfa-security-freeze-1" as const;

export const MFA_FACTOR_KINDS = [
  "TOTP",
  "SMS",
  "EMAIL",
  "WEBAUTHN",
] as const;

export const MFA_ENROLLMENT_STATUSES = [
  "PENDING",
  "ACTIVE",
  "DISABLED",
] as const;

export const MFA_CHALLENGE_STATUSES = [
  "OPEN",
  "SATISFIED",
  "EXPIRED",
  "FAILED",
] as const;

export const MFA_ASSERTION_RESULTS = [
  "PASS",
  "FAIL",
] as const;

export const MFA_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const MFA_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
