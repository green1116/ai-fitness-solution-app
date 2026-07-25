/**
 * Product Operations — Operational Console constants
 * MODULE: Operations
 * BASE: enterprise-product-system-configuration-v1
 * Isolated namespace: lib/product/operations
 */

export const PRODUCT_OPERATIONS_CONSOLE_ID =
  "enterprise-product-operations-console-v1" as const;

export const PRODUCT_OPERATIONS_CONSOLE_VERSION =
  "product-operations-1" as const;

export const PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION =
  "product-operations-console-freeze-1" as const;

export const PRODUCT_OPERATIONS_CONSOLE_BASE =
  "enterprise-product-system-configuration-v1" as const;

export const PRODUCT_OPERATIONS_FREEZE_VERSION =
  "product-operations-console-freeze-1" as const;

export const OPS_CONSOLE_KINDS = [
  "PLATFORM",
  "TENANT",
  "SUPPORT",
] as const;

export const OPS_CONSOLE_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "RETIRED",
] as const;

export const OPS_INCIDENT_SEVERITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const OPS_INCIDENT_STATUSES = [
  "OPEN",
  "ACKNOWLEDGED",
  "RESOLVED",
] as const;

export const OPS_PLAYBOOK_KINDS = [
  "RECOVERY",
  "ESCALATION",
  "MAINTENANCE",
] as const;

export const OPS_DISPATCH_STATUSES = [
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
] as const;

export const OPERATIONS_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const OPERATIONS_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
