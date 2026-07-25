/**
 * Product P12 — Production Launch constants
 * BASE: enterprise-product-p11-commercial-release-v1
 * Isolated namespace: lib/product/p12
 */

export const PRODUCT_P12_PRODUCTION_LAUNCH_ID =
  "enterprise-product-p12-production-launch-v1" as const;

export const PRODUCT_P12_PRODUCTION_LAUNCH_VERSION =
  "product-p12-1" as const;

export const PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION =
  "product-p12-production-launch-freeze-1" as const;

export const PRODUCT_P12_PRODUCTION_LAUNCH_BASE =
  "enterprise-product-p11-commercial-release-v1" as const;

export const PRODUCT_P12_LAUNCH_FREEZE_VERSION =
  "product-p12-production-launch-freeze-1" as const;

export const LAUNCH_STATUSES = [
  "PLANNED",
  "READY_CHECK",
  "ROLLING_OUT",
  "LIVE",
  "STABILIZING",
  "COMPLETE",
] as const;

export const READINESS_GATES = [
  "PASS",
  "WARN",
  "FAIL",
  "PENDING",
] as const;

export const ROLLOUT_STRATEGIES = [
  "CANARY",
  "PHASED",
  "BIG_BANG",
  "BLUE_GREEN",
] as const;

export const ADOPTION_LEVELS = [
  "AWARE",
  "TRIAL",
  "ACTIVE",
  "EMBEDDED",
  "CHAMPION",
] as const;

export const OPERATIONS_MODES = [
  "HYPERCARE",
  "STEADY",
  "SCALE",
  "HANDOFF",
] as const;

export const MONITORING_SEVERITIES = [
  "INFO",
  "WARN",
  "ERROR",
  "CRITICAL",
] as const;

export const SUPPORT_PRIORITIES = [
  "P1",
  "P2",
  "P3",
  "P4",
] as const;

export const P12_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P12_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
