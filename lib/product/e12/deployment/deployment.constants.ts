/**
 * E12-P6 — Deployment Package Layer constants
 * BASE: enterprise-e12-p5-api-productization-v1
 */

export const E12_DEPLOYMENT_PACKAGE_ID =
  "enterprise-e12-deployment-package-v1" as const;

export const E12_DEPLOYMENT_PACKAGE_VERSION = "e12-deployment-1" as const;
export const E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION =
  "e12-deployment-package-freeze-1" as const;

export const E12_DEPLOYMENT_PACKAGE_BASE =
  "enterprise-e12-p5-api-productization-v1" as const;

export const E12_P6_DEPLOYMENT_PACKAGE_FREEZE_VERSION =
  "e12-p6-deployment-package-freeze-1" as const;

export const DEPLOYMENT_PACKAGE_STATUSES = [
  "DRAFT",
  "VALIDATED",
  "RELEASED",
  "ARCHIVED",
] as const;

export const ENVIRONMENT_PROFILE_KINDS = [
  "DEVELOPMENT",
  "STAGING",
  "PRODUCTION",
] as const;

export const ENVIRONMENT_PROFILE_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const DEPLOYMENT_CONFIG_SCOPES = [
  "PACKAGE",
  "ENVIRONMENT",
  "ENTERPRISE",
] as const;

export const VALIDATION_VERDICTS = ["PASS", "FAIL"] as const;

export const RELEASE_ARTIFACT_STATUSES = [
  "BUILT",
  "SIGNED",
  "DISTRIBUTED",
] as const;

export const DEPLOYMENT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
