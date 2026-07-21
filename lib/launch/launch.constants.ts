/**
 * Launch P1 — Production Deployment Foundation constants
 * BASE: enterprise-e12-productization-complete-v1
 */

export const LAUNCH_PRODUCTION_FOUNDATION_ID =
  "enterprise-launch-p1-production-deployment-foundation-v1" as const;

export const LAUNCH_PRODUCTION_FOUNDATION_VERSION = "launch-p1-1" as const;
export const LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION =
  "launch-production-foundation-freeze-1" as const;

export const LAUNCH_PRODUCTION_FOUNDATION_BASE =
  "enterprise-e12-productization-complete-v1" as const;

export const LAUNCH_P1_PRODUCTION_FREEZE_VERSION =
  "launch-p1-production-deployment-foundation-freeze-1" as const;

export const PRODUCTION_PROFILE_STATUSES = [
  "DRAFT",
  "READY",
  "ACTIVE",
  "ARCHIVED",
] as const;

export const RELEASE_CHECKLIST_ITEM_STATUSES = [
  "PENDING",
  "PASSED",
  "FAILED",
  "SKIPPED",
] as const;

export const DEPLOYMENT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const PRODUCTION_ARTIFACT_KINDS = [
  "DEPLOYMENT_PACKAGE",
  "RELEASE_ARTIFACT",
  "INSTALLATION_MANIFEST",
  "LAUNCH_MANIFEST",
] as const;

export const PRODUCTION_ARTIFACT_STATUSES = [
  "REGISTERED",
  "VERIFIED",
  "PROMOTED",
] as const;

export const LAUNCH_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
