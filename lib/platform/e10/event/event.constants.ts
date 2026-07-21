/**
 * E10-P4 — Platform Event Bus constants
 * BASE: enterprise-e10-p3-platform-resource-v1
 */

export const E10_EVENT_ID =
  "enterprise-e10-platform-event-v1" as const;

export const E10_EVENT_VERSION = "e10-event-1" as const;
export const E10_EVENT_FREEZE_VERSION =
  "e10-event-freeze-1" as const;

export const E10_EVENT_BASE =
  "enterprise-e10-p3-platform-resource-v1" as const;

export const EVENT_KINDS = [
  "SYSTEM",
  "RUNTIME",
  "RESOURCE",
  "DOMAIN",
  "SIGNAL",
] as const;

export const EVENT_PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
  "CRITICAL",
] as const;

export const LISTENER_STATUSES = [
  "REGISTERED",
  "ACTIVE",
  "PAUSED",
  "REMOVED",
] as const;

export const EVENT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;

export const DISPATCH_STATUSES = [
  "DELIVERED",
  "PARTIAL",
  "FAILED",
  "SKIPPED",
] as const;
